import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Divider, Grid, HStack, Stack, Text } from "@chakra-ui/layout";
import * as React from "react";
import { useActiveWorkout } from "../../context/WorkoutContext";
import { Workout, WorkoutPart } from "../../types";
import { templateColumns, WorkoutIntervalInput } from "./WorkoutIntervalInput";
import { DropResult } from "react-beautiful-dnd";
import { DraggableList } from "./DraggableList";
import { DraggableItem } from "./DraggableItem";
import {
  formatHoursMinutesAndSecondsAsString,
  secondsToHoursMinutesAndSeconds,
} from "../../utils";
import { useUser } from "../../context/UserContext";
import { saveWorkout } from "../../api";
interface Props {
  setWorkout: (workout: Workout) => void;
  workout?: Workout;
  cancel: () => void;
}

interface EditableWorkoutPart extends WorkoutPart {
  id: number;
}
interface EditableWorkout extends Workout {
  parts: EditableWorkoutPart[];
}

export const WorkoutEditor = ({
  setWorkout: setGlobalWorkout,
  workout: loadedWorkout,
  cancel,
}: Props) => {
  const { setActiveWorkout } = useActiveWorkout();
  const { user } = useUser();
  const token = user.loggedIn && user.token;

  const [workout, setWorkout] = React.useState<EditableWorkout>(
    loadedWorkout
      ? {
          ...loadedWorkout,
          parts: loadedWorkout.parts.map((part, i) => ({ ...part, id: i })),
        }
      : {
          name: "New workout",
          parts: [],
          id: "",
        }
  );
  const checkValidation = true;
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

  const getNextWorkoutPartsId = (workoutParts: EditableWorkoutPart[]) =>
    workoutParts.reduce((maxId, cur) => Math.max(maxId, cur.id), 0) + 1;

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
        <Grid templateColumns={templateColumns} gap="1" mb="2">
          <Text />
          <Text>Hours</Text>
          <Text>Minutes</Text>
          <Text>Seconds</Text>
          <Text />
          <Text>Power</Text>
        </Grid>
      ) : null}
      <DraggableList onDragEnd={onDragEnd}>
        {workout.parts.map((part, index) => (
          <DraggableItem id={part.id + ""} index={index} key={part.id}>
            <WorkoutIntervalInput
              key={part.id}
              checkValidation={checkValidation}
              removeWorkoutPart={() =>
                setWorkout((workout) => ({
                  ...workout,
                  parts: workout.parts.filter((_part, i) => index !== i),
                }))
              }
              duplicateWorkoutPart={() =>
                setWorkout((workout) => {
                  const newParts = [...workout.parts];
                  newParts.splice(index + 1, 0, {
                    ...workout.parts[index],
                    id: getNextWorkoutPartsId(workout.parts),
                  });
                  console.log("newWorkoutsParts:", newParts);
                  return {
                    ...workout,
                    parts: newParts,
                  };
                })
              }
              setWorkoutPart={(workoutPart: WorkoutPart) => {
                setWorkout((workout) => {
                  return {
                    ...workout,
                    parts: workout.parts.map((part, i) =>
                      index === i ? { ...part, ...workoutPart } : part
                    ),
                  };
                });
              }}
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
                id: getNextWorkoutPartsId(workout.parts),
              },
            ],
          }))
        }
      >
        Add part
      </Button>
      <Text>Total duration: {totalDurationFormatted}</Text>
      <HStack>
        <Button
          onClick={() => {
            token && saveWorkout(token, { workout });
            cancel();
          }}
        >
          Save
        </Button>
        <Button onClick={cancel}>Cancel</Button>
      </HStack>
    </Stack>
  );
};
