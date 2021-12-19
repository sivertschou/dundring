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
export const templateColumns = '1fr repeat(3, 3fr) 1fr 5fr 1fr 1fr';

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

  const [powerInput, setPowerInput] = React.useState(
    '' + workoutPart.targetPower
  );

  console.log(powerInput);

  const [ftpInput, setFtpInput] = React.useState(
    '' + parseInputAsInt('' + (100 * workoutPart.targetPower) / ftp)
  );

  const setPowerInputFromFtp = (ftpPct: string) =>
    setPowerInput(
      '' + parseInputAsInt('' + parseInputAsInt(ftpPct) * ftp * 0.01)
    );

  const setFtpInputFromPower = (power: string) =>
    setFtpInput(
      '' + parseInputAsInt('' + (100 * parseInputAsInt(power)) / ftp)
    );

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

  const updateInputs = () => {
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

    setWorkoutPart({
      duration: newDuration,
      targetPower: parseInputAsInt(powerInput),
    });
  };

  const durationIsInvalid =
    calculateNewDuration(hoursInput, minutesInput, secondsInput) <= 0;
  const powerAsNumber = parseInputAsInt(powerInput);
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
            placeholder="hours"
            type="number"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
            onBlur={updateInputs}
          />
          <InputRightAddon children="h" />
        </InputGroup>
      </FormControl>
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
            value={secondsInput}
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
