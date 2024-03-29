import { Button, Center, Grid, Stack, Text } from '@chakra-ui/react';
import { useWorkoutState } from '../../hooks/useWorkoutState';
import { useData } from '../../context/DataContext';
import { relativeHours } from '@dundring/utils';
import { startNewWorkout } from '../../db';

export const RecoverWorkout = () => {
  const {
    firstDatapoint,
    lastDatapoint,
    showRecoverPrompt,
    setShowRecoverPrompt,
  } = useWorkoutState();

  const { state } = useData();

  if (!firstDatapoint || !lastDatapoint) return null;

  if (state !== 'not_started') return null;

  if (!showRecoverPrompt) return null;

  const timeAgo = relativeHours(
    Math.floor(Date.now() - firstDatapoint.timestamp.getTime())
  );

  return (
    <Grid templateColumns="2fr 1fr" gap="2">
      <Stack>
        <Text fontWeight="bold">Recent workout data found!</Text>
        <Text>
          We found workout data from a workout you started {timeAgo}. Do you
          want to continue or start a new workout?
        </Text>
      </Stack>

      <Center>
        <Stack>
          <Button onClick={() => setShowRecoverPrompt(false)}>
            Continue workout
          </Button>
          <Button onClick={() => startNewWorkout()}>Start new workout</Button>
        </Stack>
      </Center>
    </Grid>
  );
};
