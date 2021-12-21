import { IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Text, Grid, Center } from '@chakra-ui/layout';
import { FormControl } from '@chakra-ui/react';
import * as React from 'react';
import { Files, List, X } from 'react-bootstrap-icons';
import { WorkoutPart } from '../../types';
import {
  ftpPercentFromWatt,
  parseInputAsInt,
  secondsToMinutesAndSeconds,
  wattFromFtpPercent,
} from '../../utils';
import { findZone } from '../../zones';

interface Props {
  workoutPart: WorkoutPart;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
  removeWorkoutPart: () => void;
  duplicateWorkoutPart: () => void;
  ftp: number;
}
export const templateColumns = '1fr repeat(2, 3fr) 1fr 2fr 2fr 1fr 1fr 1fr';

export const WorkoutIntervalInput = ({
  setWorkoutPart,
  removeWorkoutPart,
  duplicateWorkoutPart,
  workoutPart,
  ftp,
}: Props) => {
  const [ftpInput, setFtpInput] = React.useState('' + workoutPart.targetPower);

  const [tmpPowerInput, setTmpPowerInput] = React.useState(
    '' + wattFromFtpPercent(parseInputAsInt(ftpInput), ftp)
  );

  const powerValue = wattFromFtpPercent(parseInputAsInt(ftpInput), ftp);

  const ftpPctValue = parseInputAsInt(ftpInput);

  React.useEffect(() => {
    setTmpPowerInput('' + wattFromFtpPercent(ftpPctValue, ftp));
  }, [ftp, ftpPctValue]);

  const [usingTmpPowerInput, setUsingTmpPowerInput] = React.useState(false);

  const { minutes, seconds } = secondsToMinutesAndSeconds(workoutPart.duration);

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

  const updateDurations = () => {
    const newDuration = calculateNewDuration(minutesInput, secondsInput);
    const { minutes, seconds } = secondsToMinutesAndSeconds(newDuration);

    setMinutesInput(minutes.toString());
    setSecondsInput(seconds.toString());

    return newDuration;
  };

  const updateInputs = () => {
    const newDuration = updateDurations();
    const targetPower = parseInputAsInt(ftpInput);

    setWorkoutPart({
      duration: newDuration,
      targetPower,
    });
  };

  const durationIsInvalid =
    calculateNewDuration(minutesInput, secondsInput) <= 0;
  const powerIsInvalid = powerValue <= 0;

  const ftpIsInvalid = parseInputAsInt(ftpInput) <= 0;
  return (
    <Grid templateColumns={templateColumns} gap="1" marginY="1">
      <Center>
        <Icon as={List} />
      </Center>
      <FormControl isInvalid={durationIsInvalid}>
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
      <FormControl isInvalid={durationIsInvalid}>
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
      <FormControl isInvalid={powerIsInvalid || ftpIsInvalid}>
        <InputGroup>
          <Input
            placeholder="power"
            type="number"
            value={usingTmpPowerInput ? tmpPowerInput : powerValue + ''}
            onChange={(e) => {
              setTmpPowerInput(e.target.value);
            }}
            onFocus={() => setUsingTmpPowerInput(true)}
            onBlur={() => {
              setUsingTmpPowerInput(false);
              const powerAsFtpPercent = ftpPercentFromWatt(
                parseInputAsInt(tmpPowerInput),
                ftp
              );
              setFtpInput('' + powerAsFtpPercent);
              setTmpPowerInput('' + wattFromFtpPercent(powerAsFtpPercent, ftp));
              updateInputs();
            }}
          />
          <InputRightAddon children="W" />
        </InputGroup>
      </FormControl>
      <FormControl isInvalid={powerIsInvalid || ftpIsInvalid}>
        <InputGroup>
          <Input
            placeholder="%FTP"
            type="number"
            value={
              usingTmpPowerInput
                ? '' + ftpPercentFromWatt(parseInputAsInt(tmpPowerInput), ftp)
                : ftpInput
            }
            onChange={(e) => {
              setFtpInput(e.target.value);
              setTmpPowerInput(
                '' + ftpPercentFromWatt(parseInputAsInt(e.target.value), ftp)
              );
            }}
            onBlur={updateInputs}
          />
          <InputRightAddon children="%" />
        </InputGroup>
      </FormControl>
      <Tooltip label="zone">
        <Center>{findZone(ftpPctValue)}</Center>
      </Tooltip>
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
