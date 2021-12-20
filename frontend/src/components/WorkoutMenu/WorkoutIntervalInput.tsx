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
    (p: string) => {
      setFtpWhenPowerSet(ftp);
      setPowerInputBasic(p);
    },
    [ftp]
  );

  const [ftpInput, setFtpInput] = React.useState(
    '' + parseInputAsInt('' + (100 * workoutPart.targetPower) / ftp)
  );
  console.log({ w: workoutPart.targetPower, powerInput, ftpInput });

  const setFtpInputFromPower = (power: string) =>
    setFtpInput('' + Math.ceil((100 * parseInputAsInt(power)) / ftp));

  const powerAsNumber = parseInputAsInt(powerInput);

  const setPowerInputFromFtp = (ftpInput: string) =>
    setPowerInput(
      '' + parseInputAsInt('' + 0.01 * parseInputAsInt(ftpInput) * ftp)
    );

  const setNewPower = React.useCallback(() => {
    console.log('new');
    if (ftpWhenPowerSet === ftp) return;
    setPowerInput(
      '' + parseInputAsInt('' + 0.01 * parseInputAsInt(ftpInput) * ftp)
    );
  }, [ftp, ftpInput, ftpWhenPowerSet, setPowerInput]);

  const { hours, minutes, seconds } = secondsToHoursMinutesAndSeconds(
    workoutPart.duration
  );
  const [hoursInput, setHoursInput] = React.useState('' + hours);
  const [minutesInput, setMinutesInput] = React.useState('' + minutes);
  const [secondsInput, setSecondsInput] = React.useState('' + seconds);

  const calculateNewDuration = (
    hoursInput: string,
    minutesInput: string,
    secondsInput: string
  ) => {
    const hoursAsSeconds = parseInputAsInt(hoursInput) * 3600;
    const minutesAsSeconds = parseInputAsInt(minutesInput) * 60;
    const secondsAsSeconds = parseInputAsInt(secondsInput);

    const totalSeconds = hoursAsSeconds + minutesAsSeconds + secondsAsSeconds;
    if (totalSeconds < 0) {
      return 0;
    }
    return totalSeconds;
  };

  const updateDurations = () => {
    const newDuration = calculateNewDuration(
      hoursInput,
      minutesInput,
      secondsInput
    );
    const { hours, minutes, seconds } =
      secondsToHoursMinutesAndSeconds(newDuration);

    setHoursInput(hours.toString());
    setMinutesInput(minutes.toString());
    setSecondsInput(seconds.toString());

    return newDuration;
  };

  const updateInputs = () => {
    const newDuration = updateDurations();

    setWorkoutPart({
      duration: newDuration,
      targetPower: parseInputAsInt(powerInput),
    });
  };

  React.useEffect(() => {
    setNewPower();
    if (parseInputAsInt(powerInput) === workoutPart.targetPower) return;
    setWorkoutPart({
      duration: 0,
      targetPower: parseInputAsInt(powerInput),
    });
  }, [ftp, setNewPower, setWorkoutPart, powerInput, workoutPart.targetPower]);

  const durationIsInvalid =
    calculateNewDuration(hoursInput, minutesInput, secondsInput) <= 0;
  const powerIsInvalid = powerAsNumber <= 0;

  const ftpIsInvalid = parseInputAsInt(ftpInput) <= 0;
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
              setFtpInputFromPower(e.target.value);
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
            value={ftpInput}
            onChange={(e) => {
              setFtpInput(e.target.value);
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
