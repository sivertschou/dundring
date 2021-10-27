import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { HStack, Text, Grid } from "@chakra-ui/layout";
import * as React from "react";
import { Workout as WorkoutType } from "./types";

interface Props {
  setWorkout: (workout: WorkoutType) => void;
}
export const WorkoutEditor = ({ setWorkout: setGlobalWorkout }: Props) => {
  const [workout, setWorkout] = React.useState<WorkoutType>({
    name: "New workout",
    parts: [],
  });

  return (
    <>
      <Input
        value={workout.name}
        onChange={(e) =>
          setWorkout((workout) => ({ ...workout, name: e.target.value }))
        }
      />
      <Button
        onClick={() =>
          setWorkout((workout) => ({
            ...workout,
            parts: [...workout.parts, { duration: 300, targetPower: 200 }],
          }))
        }
      >
        Add part
      </Button>
      <Button
        onClick={() => {
          setGlobalWorkout(workout);
        }}
      >
        Use workout
      </Button>
      <Text>{workout.name}</Text>
      {workout.parts.map((part, i) => (
        <Grid key={i} templateColumns="1fr 1fr" gap="2">
          <HStack>
            <Text>Duration (s)</Text>

            <Input
              type="number"
              value={part.duration}
              onChange={(e) =>
                setWorkout((workout) => ({
                  ...workout,
                  parts: workout.parts.map((part, j) =>
                    i === j
                      ? { ...part, duration: parseInt(e.target.value) }
                      : part
                  ),
                }))
              }
            />
          </HStack>
          <HStack>
            <Text>Target power (w)</Text>
            <Input
              type="number"
              value={part.targetPower}
              onChange={(e) =>
                setWorkout((workout) => ({
                  ...workout,
                  parts: workout.parts.map((part, j) =>
                    i === j
                      ? { ...part, targetPower: parseInt(e.target.value) }
                      : part
                  ),
                }))
              }
            />
          </HStack>
        </Grid>
      ))}
    </>
  );
};
