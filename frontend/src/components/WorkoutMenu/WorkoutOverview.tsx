import { Button } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Divider, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { PencilSquare } from "react-bootstrap-icons";
import { useUser } from "../../context/UserContext";
import { Workout } from "../../types";
import { WorkoutListItem } from "./WorkoutListItem";

interface Props {
  setActiveWorkout: (workout: Workout) => void;
  setWorkoutToEdit: (workout: Workout) => void;
}
export const WorkoutOverview = ({
  setWorkoutToEdit,
  setActiveWorkout,
}: Props) => {
  const { workouts } = useUser();
  return (
    <Stack p="5">
      <Button
        fontSize="xl"
        mb="5"
        rightIcon={<Icon as={PencilSquare} />}
        onClick={() =>
          setWorkoutToEdit({ name: "New workout", parts: [], id: "" })
        }
      >
        Create new workout
      </Button>
      <Divider />
      {workouts.map((workout, i) => (
        <WorkoutListItem
          key={`${i}-${workout.name}`}
          workout={workout}
          setActiveWorkout={setActiveWorkout}
          onClickEdit={() => {
            setWorkoutToEdit(workout);
          }}
        />
      ))}
    </Stack>
  );
};
