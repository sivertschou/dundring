import { Button, IconButton } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Center, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/layout';
import { useClipboard, useToast } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/tooltip';
import { Cloud, Gear, Hdd, Clipboard, Book } from 'react-bootstrap-icons';
import { Workout, WorkoutType } from '../../types';
import {
  getTotalWorkoutTime,
  secondsToHoursMinutesAndSecondsString,
} from '@dundring/utils';
import * as api from '../../api';

interface Props {
  workout: Workout;
  setActiveWorkout: (workout: Workout) => void;
  onClickEdit: () => void;
  type: WorkoutType;
}
export const WorkoutListItem = ({
  workout,
  setActiveWorkout,
  onClickEdit,
  type,
}: Props) => {
  const workoutDuration = getTotalWorkoutTime(workout);
  const { onCopy } = useClipboard(`${api.domain}/workout/${workout.id}`);
  const toast = useToast();

  return (
    <Grid templateColumns="1fr 10fr 3fr">
      <WorkoutIcon type={type} />
      <Stack spacing="0">
        <Heading as="h2" fontSize="2xl">
          {workout.name}
        </Heading>
        <Text>
          Duration: {secondsToHoursMinutesAndSecondsString(workoutDuration)}
        </Text>
      </Stack>
      <HStack>
        {type === 'remote' && (
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

const WorkoutIcon = ({ type }: { type: WorkoutType }) => {
  if (type === 'library') {
    return (
      <Tooltip label={`Workout is from the workout library`} placement="left">
        <Center>
          <Icon as={Book} />
        </Center>
      </Tooltip>
    );
  }
  return (
    <Tooltip
      label={`Workout is stored ${
        type === 'remote' ? 'in the browser' : 'remotely'
      }`}
      placement="left"
    >
      <Center>
        <Icon as={type === 'local' ? Hdd : Cloud} />
      </Center>
    </Tooltip>
  );
};
