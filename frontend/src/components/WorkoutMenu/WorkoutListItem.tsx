import { Button, IconButton } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Grid, Heading, HStack, Stack, Text } from "@chakra-ui/layout";
import * as React from "react";
import { Gear } from "react-bootstrap-icons";
import { Workout } from "../../types";
import {
  formatHoursMinutesAndSecondsAsString,
  getTotalWorkoutTime,
  secondsToHoursMinutesAndSeconds,
} from "../../utils";

interface Props {
  workout: Workout;
  setActiveWorkout: (workout: Workout) => void;
}
export const WorkoutListItem = ({ workout, setActiveWorkout }: Props) => {
  const workoutDuration = getTotalWorkoutTime(workout);
  const formattedDuration = formatHoursMinutesAndSecondsAsString(
    secondsToHoursMinutesAndSeconds(workoutDuration)
  );

  return (
    <Grid templateColumns="3fr 1fr">
      <Stack spacing="0">
        <Heading as="h2" fontSize="2xl">
          {workout.name}
        </Heading>
        <Text>Duration: {formattedDuration}</Text>
      </Stack>
      <HStack>
        <Button width="100%" onClick={() => setActiveWorkout(workout)}>
          Use
        </Button>
        <IconButton
          aria-label="Edit workout"
          icon={<Icon as={Gear} />}
          isRound
        />
      </HStack>
    </Grid>
  );
};
