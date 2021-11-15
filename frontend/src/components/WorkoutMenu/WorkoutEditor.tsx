import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Divider, Grid, Stack, Text } from "@chakra-ui/layout";
import * as React from "react";
import { useActiveWorkout } from "../../context/WorkoutContext";
import { Workout, WorkoutPart } from "../../types";
import { WorkoutIntervalInput } from "./WorkoutIntervalInput";
import { DropResult } from "react-beautiful-dnd";
import { DraggableList } from "./DraggableList";
import { DraggableItem } from "./DraggableItem";
import {
  formatHoursMinutesAndSecondsAsString,
  secondsToHoursMinutesAndSeconds,
} from "../../utils";
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

  const totalDuration = workout.parts.reduce(
    (sum, part) => sum + part.duration,
    0
  );
  const totalDurationFormatted = formatHoursMinutesAndSecondsAsString(
    secondsToHoursMinutesAndSeconds(totalDuration)
  );

  function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    // reorderedParts
    if (!destination) {
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedArray = [...workout.parts];
    updatedArray.splice(source.index, 1);
    updatedArray.splice(destination.index, 0, workout.parts[source.index]);
    setWorkout((workout) => ({ ...workout, parts: updatedArray }));
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

      {workout.parts.length > 0 ? (
        <Grid templateColumns="1fr repeat(3, 3fr) 1fr 5fr 1fr" gap="1" mb="2">
          <Text />
          <Text>Hours</Text>
          <Text>Minutes</Text>
          <Text>Seconds</Text>
          <Text />
          <Text>Power</Text>
        </Grid>
      ) : null}
      <DraggableList onDragEnd={onDragEnd}>
        {workout.parts.map((part, i) => (
          <DraggableItem id={part.id + ""} index={i} key={part.id}>
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
      <Text>Total duration: {totalDurationFormatted}</Text>
    </Stack>
  );
};
