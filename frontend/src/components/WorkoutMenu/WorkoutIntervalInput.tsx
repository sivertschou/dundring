import { IconButton } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Input, InputGroup, InputRightAddon } from "@chakra-ui/input";
import { Text, Grid, Center } from "@chakra-ui/layout";
import { FormControl } from "@chakra-ui/react";
import * as React from "react";
import { List, X } from "react-bootstrap-icons";
import { WorkoutPart } from "../../types";
import { secondsToHoursMinutesAndSeconds } from "../../utils";

interface Props {
  workoutPart: WorkoutPart;
  setWorkoutPart: (workoutPart: WorkoutPart) => void;
  removeWorkoutPart: () => void;
  checkValidation: boolean;
}
export const WorkoutIntervalInput = ({
  setWorkoutPart,
  removeWorkoutPart,
  checkValidation,
  workoutPart,
}: Props) => {
  const [powerInput, setPowerInput] = React.useState(
    "" + workoutPart.targetPower
  );

  const { hours, minutes, seconds } = secondsToHoursMinutesAndSeconds(
    workoutPart.duration
  );
  const [hoursInput, setHoursInput] = React.useState("" + hours);
  const [minutesInput, setMinutesInput] = React.useState("" + minutes);
  const [secondsInput, setSecondsInput] = React.useState("" + seconds);

  const parseInput = (input: string) => {
    const parsed = parseInt(input);
    if (isNaN(parsed)) {
      return 0;
    }
    return parsed;
  };
  const calculateNewDuration = (
    hoursInput: string,
    minutesInput: string,
    secondsInput: string
  ) => {
    const hoursAsSeconds = parseInput(hoursInput) * 3600;
    const minutesAsSeconds = parseInput(minutesInput) * 60;
    const secondsAsSeconds = parseInput(secondsInput);

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
      targetPower: parseInput(powerInput),
    });
  };

  const durationIsInvalid =
    calculateNewDuration(hoursInput, minutesInput, secondsInput) <= 0;
  const powerAsNumber = parseInput(powerInput);
  const powerIsInvalid = powerAsNumber <= 0;
  return (
    <Grid templateColumns="1fr repeat(3, 3fr) 1fr 5fr 1fr" gap="1" mb="2">
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
      <Center>
        <IconButton
          aria-label="Remove interval"
          variant="ghost"
          onClick={removeWorkoutPart}
          icon={<Icon as={X} />}
        />
      </Center>
    </Grid>
  );
};
