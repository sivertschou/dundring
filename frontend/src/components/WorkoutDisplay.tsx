import { Text, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { useActiveWorkout } from "../context/WorkoutContext";
import * as utils from "../utils";

export const WorkoutDisplay = () => {
  const { activeWorkout } = useActiveWorkout();
  if (!activeWorkout.workout) {
    return null;
  }

  const { activePart, isDone, partElapsedTime, workout } = activeWorkout;
  const formattedElapsedTime = utils.formatHoursMinutesAndSecondsAsString(
    utils.secondsToHoursMinutesAndSeconds(partElapsedTime)
  );
  return (
    <Stack>
      <Text>{workout.name}</Text>
      <Text>{formattedElapsedTime}</Text>
      {workout.parts.map((part, i) => {
        return (
          <Text key={i} color={!isDone && i === activePart ? "orange" : ""}>
            {`${utils.formatHoursMinutesAndSecondsAsString(
              utils.secondsToHoursMinutesAndSeconds(part.duration)
            )}@${part.targetPower}w`}
          </Text>
        );
      })}
      {isDone ? <Text>DONE!</Text> : null}
    </Stack>
  );
};
