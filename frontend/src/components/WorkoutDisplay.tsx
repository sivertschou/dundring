import { Text, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { useActiveWorkout } from "../context/WorkoutContext";
import * as utils from "../utils";

export const WorkoutDisplay = () => {
  // const { workout, partElapsedTime, activePart, isDone } =
  //   React.useContext(WorkoutContext);

  const { activeWorkout } = useActiveWorkout();
  console.log("ACTIVE_WORKOUT:", activeWorkout);
  if (!activeWorkout) {
    return null;
  }

  const { activePart, isDone, partElapsedTime, workout } = activeWorkout;
  return (
    <Stack>
      <Text>{workout.name}</Text>
      <Text>Elapsed this part: {partElapsedTime}</Text>
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
