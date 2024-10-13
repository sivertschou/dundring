import {
  Button,
  Center,
  Divider,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import * as React from 'react';
import {
  ArrowRepeat,
  PauseFill,
  PlayFill,
  SkipBackwardFill,
  SkipForwardFill,
  SkipStartFill,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkoutSession } from '../../context/ActiveWorkoutSessionContext';
import { useData } from '../../context/DataContext';
import { useLinkColor } from '../../hooks/useLinkColor';
import { ActiveWorkoutSession } from '../../types';

const getPlayButtonText = (activeWorkoutSession: ActiveWorkoutSession) => {
  if (!activeWorkoutSession.workout) return 'No workout selected.';

  switch (activeWorkoutSession.status) {
    case 'not_started':
      return 'Start workout';
    case 'paused':
      return 'Resume workout';
    case 'active':
      return 'Pause workout';
    case 'finished':
      return 'Restart workout';
  }
};
export const WorkoutControls = () => {
  const {
    activeWorkoutSession,
    syncResistance,
    changeActivePart,
    pause,
    start,
  } = useActiveWorkoutSession();
  const { addLap } = useData();
  const linkColor = useLinkColor();
  const navigate = useNavigate();

  const isWorkoutSelected = activeWorkoutSession.workout !== null;
  const activeWorkoutPart = activeWorkoutSession.activePart;
  const playButtonText = getPlayButtonText(activeWorkoutSession);

  return (
    <Stack>
      <Text fontSize="xs" fontWeight="bold" opacity="0.5">
        Workout controls
      </Text>

      <Tooltip
        label="You need to select a workout to use this functionality."
        isDisabled={isWorkoutSelected}
        placement="top"
      >
        <Center>
          <HStack>
            <Tooltip label="Re-sync resistance" placement="top">
              <IconButton
                size="sm"
                aria-label="Re-sync resistance"
                icon={<Icon as={ArrowRepeat} />}
                isDisabled={!isWorkoutSelected}
                onClick={syncResistance}
              />
            </Tooltip>
            <Tooltip label="Previous part" placement="top">
              <IconButton
                size="sm"
                aria-label="Previous part"
                icon={<Icon as={SkipBackwardFill} />}
                isDisabled={
                  !isWorkoutSelected ||
                  (activeWorkoutPart === 0 &&
                    activeWorkoutSession.status !== 'finished')
                }
                onClick={() => {
                  if (!activeWorkoutSession.workout) return;

                  if (activeWorkoutSession.status === 'finished') {
                    changeActivePart(
                      activeWorkoutSession.workout.parts.length - 1,
                      addLap
                    );
                    return;
                  }
                  if (activeWorkoutPart <= 0) return;

                  changeActivePart(activeWorkoutPart - 1, addLap);
                }}
              />
            </Tooltip>

            <Tooltip label="Go to start of the part" placement="top">
              <IconButton
                size="sm"
                aria-label="Go to start of the part"
                icon={<Icon as={SkipStartFill} />}
                isDisabled={!isWorkoutSelected}
                onClick={() => {
                  if (!activeWorkoutSession.workout) return;

                  changeActivePart(activeWorkoutPart, addLap);
                }}
              />
            </Tooltip>

            <Tooltip label={playButtonText} placement="top">
              <IconButton
                size="sm"
                aria-label={playButtonText}
                icon={
                  <Icon
                    as={
                      activeWorkoutSession.status === 'active'
                        ? PauseFill
                        : PlayFill
                    }
                  />
                }
                isDisabled={!isWorkoutSelected}
                onClick={() => {
                  if (!activeWorkoutSession.workout) return;

                  switch (activeWorkoutSession.status) {
                    case 'finished': {
                      changeActivePart(0, addLap);
                      return;
                    }

                    case 'active': {
                      pause();
                      return;
                    }
                    default: {
                      start();
                      return;
                    }
                  }
                }}
              />
            </Tooltip>
            <Tooltip label="Next part" placement="top">
              <IconButton
                size="sm"
                aria-label="Next part"
                icon={<Icon as={SkipForwardFill} />}
                isDisabled={!isWorkoutSelected}
                onClick={() => {
                  if (!activeWorkoutSession.workout) return;

                  if (activeWorkoutSession.status === 'finished') {
                    changeActivePart(0, addLap);
                  } else {
                    changeActivePart(activeWorkoutPart + 1, addLap);
                  }
                }}
              />
            </Tooltip>
          </HStack>
        </Center>
      </Tooltip>

      {!isWorkoutSelected ? (
        <>
          <Center>
            <HStack>
              <Button
                variant="link"
                color={linkColor}
                onClick={() => navigate('/workout')}
              >
                Select workout
              </Button>
            </HStack>
          </Center>
          <Divider />
        </>
      ) : null}
    </Stack>
  );
};
