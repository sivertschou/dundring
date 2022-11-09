import { Button, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Center, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/layout';
import { useClipboard, useToast } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/tooltip';
import { Cloud, Gear, Hdd, Clipboard } from 'react-bootstrap-icons';
import { Workout } from '../../types';
import {
  getTotalWorkoutTime,
  secondsToHoursMinutesAndSecondsString,
} from '@dundring/utils';
import * as api from '../../api';

interface Props {
  username: string | null;
  workout: Workout;
  setActiveWorkout: (workout: Workout) => void;
  onClickEdit: () => void;
  isLocallyStored: boolean;
}
export const WorkoutListItem = ({
  username,
  workout,
  setActiveWorkout,
  onClickEdit,
  isLocallyStored,
}: Props) => {
  const workoutDuration = getTotalWorkoutTime(workout);
  const { onCopy } = useClipboard(
    `${api.domain}/workout/${username}-${workout.id}`
  );
  const toast = useToast();

  return (
    <Grid templateColumns="1fr 10fr 3fr">
      <Tooltip
        label={`Workout is stored ${
          isLocallyStored ? 'in the browser' : 'remotely'
        }`}
        placement="left"
      >
        <Center>
          <Icon as={isLocallyStored ? Hdd : Cloud} />
        </Center>
      </Tooltip>
      <Stack spacing="0">
        <Heading as="h2" fontSize="2xl">
          {workout.name}
        </Heading>
        <Text>
          Duration: {secondsToHoursMinutesAndSecondsString(workoutDuration)}
        </Text>
      </Stack>
      <HStack>
        {isLocallyStored ? null : (
          <Tooltip label="Copy import link to clipboard. Share this id to allow other people to import this workout.">
            <IconButton
              aria-label="copy"
              icon={<Icon as={Clipboard} />}
              onClick={() => {
                onCopy();
                toast({
                  title: `Copied workout link to clipboard!`,
                  isClosable: true,
                  duration: 2000,
                  status: 'success',
                });
              }}
            />
          </Tooltip>
        )}

        <Button width="100%" onClick={() => setActiveWorkout(workout)}>
          Use workout
        </Button>
        <Tooltip label="Edit workout" placement="right">
          <IconButton
            aria-label="Edit workout"
            icon={<Icon as={Gear} />}
            isRound
            onClick={() => onClickEdit()}
          />
        </Tooltip>
      </HStack>
    </Grid>
  );
};
