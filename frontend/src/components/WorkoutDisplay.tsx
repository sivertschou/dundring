import { Text, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { WorkoutContext } from "../context/WorkoutContext";
import * as utils from "../utils";

export const WorkoutDisplay = () => {
  const { workout, partElapsedTime, activePart, isDone } =
    React.useContext(WorkoutContext);

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
