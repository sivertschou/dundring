import { Button } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Divider, Stack } from "@chakra-ui/layout";
import * as React from "react";
import { PencilSquare } from "react-bootstrap-icons";
import { useUser } from "../../context/UserContext";
import { useActiveWorkout } from "../../context/WorkoutContext";
import { Workout } from "../../types";
import { WorkoutListItem } from "./WorkoutListItem";

interface Props {
  setWorkoutToEdit: (workout: Workout) => void;
}
export const WorkoutOverview = ({ setWorkoutToEdit }: Props) => {
  const { workouts } = useUser();
  const { setActiveWorkout } = useActiveWorkout();
  return (
    <Stack p="5">
      <Button
        fontSize="xl"
        mb="5"
        rightIcon={<Icon as={PencilSquare} />}
        onClick={() => setWorkoutToEdit({ name: "New workout", parts: [] })}
      >
        Create new workout
      </Button>
      <Divider />
      {workouts.map((workout, i) => (
        <WorkoutListItem
          key={`${i}-${workout.name}`}
          workout={workout}
          setActiveWorkout={setActiveWorkout}
        />
      ))}
    </Stack>
  );
};
