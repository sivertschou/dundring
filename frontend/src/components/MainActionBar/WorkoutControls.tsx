import { Center, HStack, Icon, IconButton, Tooltip } from '@chakra-ui/react';
import * as React from 'react';
import {
  ArrowRepeat,
  PauseFill,
  SkipBackwardFill,
  SkipForwardFill,
  SkipStartFill,
} from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';

export const WorkoutControls = () => {
  const { activeWorkout } = useActiveWorkout();
  const workoutSelected = activeWorkout !== null;

  return (
    <Center>
      <HStack>
        <Tooltip label="Re-sync resistance" placement="top">
          <IconButton
            size="sm"
            aria-label="Re-sync resistance"
            icon={<Icon as={ArrowRepeat} />}
            isDisabled={!workoutSelected}
          />
        </Tooltip>
        <Tooltip label="Previous part" placement="top">
          <IconButton
            size="sm"
            aria-label="Previous part"
            icon={<Icon as={SkipBackwardFill} />}
            isDisabled={!workoutSelected}
          />
        </Tooltip>

        <Tooltip label="Go to start of the part" placement="top">
          <IconButton
            size="sm"
            aria-label="Go to start of the part"
            icon={<Icon as={SkipStartFill} />}
            isDisabled={!workoutSelected}
          />
        </Tooltip>

        <Tooltip label="Pause workout timer" placement="top">
          <IconButton
            size="sm"
            aria-label="Pause workout timer"
            icon={<Icon as={PauseFill} />}
            isDisabled={!workoutSelected}
          />
        </Tooltip>
        <Tooltip label="Next part" placement="top">
          <IconButton
            size="sm"
            aria-label="Next part"
            icon={<Icon as={SkipForwardFill} />}
            isDisabled={!workoutSelected}
          />
        </Tooltip>
      </HStack>
    </Center>
  );
};
