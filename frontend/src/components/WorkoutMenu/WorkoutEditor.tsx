import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Stack } from "@chakra-ui/layout";
import * as React from "react";
import { useActiveWorkout } from "../../context/WorkoutContext";
import { Workout, WorkoutPart } from "../../types";
import { WorkoutIntervalInput } from "./WorkoutIntervalInput";

interface Props {
  setWorkout: (workout: Workout) => void;
}

interface EditableWorkoutPart extends WorkoutPart {
  id: number;
}
interface EditableWorkout extends Workout {
  parts: EditableWorkoutPart[];
}

export const WorkoutEditor = ({ setWorkout: setGlobalWorkout }: Props) => {
  const { setActiveWorkout } = useActiveWorkout();

  const [workout, setWorkout] = React.useState<EditableWorkout>({
    name: "New workout",
    parts: [],
  });

  return (
    <Stack p="5">
      <FormControl id="workoutName">
        <FormLabel>Workout name</FormLabel>
        <Input
          value={workout.name}
          onChange={(e) =>
            setWorkout((workout) => ({ ...workout, name: e.target.value }))
          }
          placeholder="Workout name"
        />
      </FormControl>
      <Button
        onClick={() => {
          console.log("SET ACTIVE WORKOUT:", workout);
          setActiveWorkout(workout);
        }}
      >
        Use workout
      </Button>
      {workout.parts.map((part, i) => (
        <WorkoutIntervalInput
          key={part.id}
          removeWorkoutPart={() =>
            setWorkout((workout) => ({
              ...workout,
              parts: workout.parts.filter((_part, x) => i !== x),
            }))
          }
          setWorkoutPart={(workoutPart: WorkoutPart) => {}}
          workoutPart={part}
        />
      ))}

      <Button
        onClick={() =>
          setWorkout((workout) => ({
            ...workout,
            parts: [
              ...workout.parts,
              {
                duration: 300,
                targetPower: 200,
                id:
                  workout.parts.reduce(
                    (maxId, cur) => Math.max(maxId, cur.id),
                    0
                  ) + 1,
              },
            ],
          }))
        }
      >
        Add part
      </Button>
    </Stack>
  );
};
