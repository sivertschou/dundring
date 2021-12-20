import { IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Text, Grid, Center } from '@chakra-ui/layout';
import { FormControl } from '@chakra-ui/react';
import * as React from 'react';
import { Files, List, X } from 'react-bootstrap-icons';
import { WorkoutPart } from '../../types';
import { secondsToHoursMinutesAndSeconds } from '../../utils';

interface Props {
  workoutPart: WorkoutPart;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
  removeWorkoutPart: () => void;
  duplicateWorkoutPart: () => void;
  checkValidation: boolean;
  ftp: number;
}
export const templateColumns = '1fr repeat(2, 3fr) 1fr 2fr 2fr 1fr 1fr';

export const WorkoutIntervalInput = ({
  setWorkoutPart,
  removeWorkoutPart,
  duplicateWorkoutPart,
  checkValidation,
  workoutPart,
  ftp,
}: Props) => {
  const parseInputAsInt = (input: string) => {
    const parsed = parseInt(input);
    if (isNaN(parsed)) {
      return 0;
    }
    return parsed;
  };

  const [powerInput, setPowerInputBasic] = React.useState(
    '' + workoutPart.targetPower
  );

  const [ftpWhenPowerSet, setFtpWhenPowerSet] = React.useState(ftp);

  const setPowerInput = React.useCallback(
    (power: string) => {
      setFtpWhenPowerSet(ftp);
      setPowerInputBasic(power);
    },
    [ftp]
  );

  const [ftpPctInput, setFtpPctInput] = React.useState(
    '' + parseInputAsInt('' + (100 * workoutPart.targetPower) / ftp)
  );

  const setFtpPctInputFromPower = (power: string) =>
    setFtpPctInput('' + Math.ceil((100 * parseInputAsInt(power)) / ftp));

  const powerAsNumber = parseInputAsInt(powerInput);

  const setPowerInputFromFtp = (ftpPctInput: string) =>
    setPowerInput(
      '' + parseInputAsInt('' + 0.01 * parseInputAsInt(ftpPctInput) * ftp)
    );

  const setNewPower = React.useCallback(() => {
    if (ftpWhenPowerSet === ftp) return;
    setPowerInput(
      '' + parseInputAsInt('' + 0.01 * parseInputAsInt(ftpPctInput) * ftp)
    );
  }, [ftp, ftpPctInput, ftpWhenPowerSet, setPowerInput]);

  const { minutes, seconds } = secondsToHoursMinutesAndSeconds(
    workoutPart.duration
  );
  const [minutesInput, setMinutesInput] = React.useState('' + minutes);
  const [secondsInput, setSecondsInput] = React.useState('' + seconds);

  const calculateNewDuration = (minutesInput: string, secondsInput: string) => {
    const minutesAsSeconds = parseInputAsInt(minutesInput) * 60;
    const secondsAsSeconds = parseInputAsInt(secondsInput);

    const totalSeconds = minutesAsSeconds + secondsAsSeconds;
    if (totalSeconds < 0) {
      return 0;
    }
    return totalSeconds;
  };

  const updateInputs = () => {
    const newDuration = calculateNewDuration(minutesInput, secondsInput);
    const { minutes, seconds } = secondsToHoursMinutesAndSeconds(newDuration);

    setMinutesInput(minutes.toString());
    setSecondsInput(seconds.toString());

    setWorkoutPart({
      duration: newDuration,
      targetPower: parseInputAsInt(powerInput),
    });
  };

  React.useEffect(() => {
    setNewPower();
    if (parseInputAsInt(powerInput) === workoutPart.targetPower) return;
    setWorkoutPart({
      duration: workoutPart.duration,
      targetPower: parseInputAsInt(powerInput),
    });
  }, [
    ftp,
    setNewPower,
    setWorkoutPart,
    powerInput,
    workoutPart.targetPower,
    workoutPart.duration,
  ]);

  const durationIsInvalid =
    calculateNewDuration(minutesInput, secondsInput) <= 0;
  const powerIsInvalid = powerAsNumber <= 0;

  const ftpIsInvalid = parseInputAsInt(ftpPctInput) <= 0;
  return (
    <Grid templateColumns={templateColumns} gap="1" marginY="1">
      <Center>
        <Icon as={List} />
      </Center>
      <FormControl isInvalid={checkValidation && durationIsInvalid}>
        <InputGroup>
          <Input
            placeholder="minutes"
            type="number"
            value={minutesInput}
            onChange={(e) => setMinutesInput(e.target.value)}
            onBlur={updateInputs}
          />
          <InputRightAddon children="m" />
        </InputGroup>
      </FormControl>
      <FormControl isInvalid={checkValidation && durationIsInvalid}>
        <InputGroup>
          <Input
            placeholder="seconds"
            type="number"
            value={0}
            onChange={(e) => {
              setSecondsInput(e.target.value);
            }}
            onBlur={updateInputs}
          />
          <InputRightAddon children="s" />
        </InputGroup>
      </FormControl>
      <Center>
        <Text fontSize="xl" fontWeight="bold">
          @
        </Text>
      </Center>
      <FormControl
        isInvalid={checkValidation && powerIsInvalid && ftpIsInvalid}
      >
        <InputGroup>
          <Input
            placeholder="power"
            type="number"
            value={powerInput}
            onChange={(e) => {
              setPowerInput(e.target.value);
              setFtpPctInputFromPower(e.target.value);
            }}
            onBlur={updateInputs}
          />
          <InputRightAddon children="W" />
        </InputGroup>
      </FormControl>
      <FormControl
        isInvalid={checkValidation && powerIsInvalid && ftpIsInvalid}
      >
        <InputGroup>
          <Input
            placeholder="%FTP"
            type="number"
            value={ftpPctInput}
            onChange={(e) => {
              setFtpPctInput(e.target.value);
              setPowerInputFromFtp(e.target.value);
            }}
            onBlur={updateInputs}
          />
          <InputRightAddon children="%" />
        </InputGroup>
      </FormControl>
      <Tooltip label="Duplicate" placement="left">
        <Center>
          <IconButton
            aria-label="Duplicate interval"
            variant="ghost"
            onClick={duplicateWorkoutPart}
            icon={<Icon as={Files} />}
          />
        </Center>
      </Tooltip>
      <Tooltip label="Remove" placement="right">
        <Center>
          <IconButton
            aria-label="Remove interval"
            variant="ghost"
            onClick={removeWorkoutPart}
            icon={<Icon as={X} />}
          />
        </Center>
      </Tooltip>
    </Grid>
  );
};
