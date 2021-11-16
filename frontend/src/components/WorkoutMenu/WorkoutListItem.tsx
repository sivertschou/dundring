import { Button, IconButton } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { Center, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/layout";
import * as React from "react";
import { Cloud, Gear, Hdd } from "react-bootstrap-icons";
import { Workout } from "../../types";
import {
  formatHoursMinutesAndSecondsAsString,
  getTotalWorkoutTime,
  secondsToHoursMinutesAndSeconds,
} from "../../utils";

interface Props {
  workout: Workout;
  setActiveWorkout: (workout: Workout) => void;
  onClickEdit: () => void;
  isLocallyStored: boolean;
}
export const WorkoutListItem = ({
  workout,
  setActiveWorkout,
  onClickEdit,
  isLocallyStored,
}: Props) => {
  const workoutDuration = getTotalWorkoutTime(workout);
  const formattedDuration = formatHoursMinutesAndSecondsAsString(
    secondsToHoursMinutesAndSeconds(workoutDuration)
  );

  return (
    <Grid templateColumns="1fr 10fr 3fr">
      <Center>
        <Icon as={isLocallyStored ? Hdd : Cloud} />
      </Center>
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
          onClick={() => onClickEdit()}
        />
      </HStack>
    </Grid>
  );
};
