import { IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { Text, Grid, Center } from '@chakra-ui/layout';
import { FormControl } from '@chakra-ui/react';
import * as React from 'react';
import { Files, List, X } from 'react-bootstrap-icons';
import { WorkoutPart } from '../../types';
import { secondsToMinutesAndSeconds } from '../../utils';

interface Props {
  workoutPart: WorkoutPart;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
  removeWorkoutPart: () => void;
  duplicateWorkoutPart: () => void;
  checkValidation: boolean;
}
export const templateColumns = '1fr repeat(2, 3fr) 1fr 5fr 1fr 1fr';

export const WorkoutIntervalInput = ({
  setWorkoutPart,
  removeWorkoutPart,
  duplicateWorkoutPart,
  checkValidation,
  workoutPart,
}: Props) => {
  const [powerInput, setPowerInput] = React.useState(
    '' + workoutPart.targetPower
  );

  const { minutes, seconds } = secondsToMinutesAndSeconds(workoutPart.duration);

  const [minutesInput, setMinutesInput] = React.useState('' + minutes);
  const [secondsInput, setSecondsInput] = React.useState('' + seconds);

  const parseInput = (input: string) => {
    const parsed = parseInt(input);
    if (isNaN(parsed)) {
      return 0;
    }
    return parsed;
  };
  const calculateNewDuration = (minutesInput: string, secondsInput: string) => {
    const minutesAsSeconds = parseInput(minutesInput) * 60;
    const secondsAsSeconds = parseInput(secondsInput);

    const totalSeconds = minutesAsSeconds + secondsAsSeconds;
    if (totalSeconds < 0) {
      return 0;
    }
    return totalSeconds;
  };

  const updateInputs = () => {
    const newDuration = calculateNewDuration(minutesInput, secondsInput);
    const { minutes, seconds } = secondsToMinutesAndSeconds(newDuration);

    setMinutesInput(minutes.toString());
    setSecondsInput(seconds.toString());

    setWorkoutPart({
      duration: newDuration,
      targetPower: parseInput(powerInput),
    });
  };

  const durationIsInvalid =
    calculateNewDuration(minutesInput, secondsInput) <= 0;
  const powerAsNumber = parseInput(powerInput);
  const powerIsInvalid = powerAsNumber <= 0;
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
      <FormControl isInvalid={checkValidation && powerIsInvalid}>
        <InputGroup>
          <Input
            placeholder="power"
            type="number"
            value={powerInput}
            onChange={(e) => setPowerInput(e.target.value)}
            onBlur={updateInputs}
          />
          <InputRightAddon children="W" />
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
