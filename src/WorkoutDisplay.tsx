import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { HStack, Text, Grid, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { WorkoutContext } from "./context/WorkoutContext";
import { useWorkout } from "./hooks/useWorkout";
import { Workout as WorkoutType } from "./types";
import * as utils from "./utils";

export const WorkoutDisplay = () => {
  const { workout, partElapsedTime, activePart } =
    React.useContext(WorkoutContext);

  console.log("workout:", workout);

  return (
    <Stack>
      <Text>{workout.name}</Text>
      <Text>Elapsed this part: {partElapsedTime}</Text>
      {workout.parts.map((part, i) => {
        return (
          <Text key={i} color={i === activePart ? "orange" : ""}>
            {`${utils.formatHoursMinutesAndSecondsAsString(
              utils.secondsToHoursMinutesAndSeconds(part.duration)
            )}@${part.targetPower}w`}
          </Text>
        );
      })}
    </Stack>
  );
};
