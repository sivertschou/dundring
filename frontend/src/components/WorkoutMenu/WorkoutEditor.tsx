import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Stack } from "@chakra-ui/layout";
import * as React from "react";
import { useActiveWorkout } from "../../context/WorkoutContext";
import { Workout, WorkoutPart } from "../../types";
import { WorkoutIntervalInput } from "./WorkoutIntervalInput";
import { DropResult } from "react-beautiful-dnd";
import { DraggableList } from "./DraggableList";
import { DraggableItem } from "./DraggableItem";
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

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    // const newItems = [...items];
    // const [removed] = newItems.splice(result.source.index, 1);
    // newItems.splice(result.destination.index, 0, removed);
    // setItems(newItems)
  }

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
      <DraggableList onDragEnd={onDragEnd}>
        {workout.parts.map((part, i) => (
          <DraggableItem id={part.id + ""} index={i}>
            <WorkoutIntervalInput
              id={`${part.id}`}
              index={i}
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
          </DraggableItem>
        ))}
      </DraggableList>

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
