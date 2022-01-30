import { Text, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { useData } from '../context/DataContext';
import { Workout } from '../types';
import { wattFromFtpPercent } from '../utils/general';
import { secondsToHoursMinutesAndSecondsString } from '../utils/time';

export const WorkoutDisplay = () => {
  const { activeWorkout, activeFtp, changeActivePart } = useActiveWorkout();
  const { addLap } = useData();
  if (!activeWorkout.workout) {
    return null;
  }

  const { activePart, status, partElapsedTime, workout } = activeWorkout;

  return (
    <Stack fontSize="sm">
      <Text>{workout.name}</Text>
      <Text>Based on {activeFtp}W FTP</Text>
      <Text>{secondsToHoursMinutesAndSecondsString(partElapsedTime)}</Text>
      {workout.parts.map((part, i) => {
        const isActive = status === 'active' && i === activePart;
        return (
          <Text
            key={i}
            fontWeight={isActive ? 'bold' : 'normal'}
            color={isActive ? 'purple.500' : ''}
            cursor="pointer"
            onClick={() => changeActivePart(i, addLap)}
          >
            {`${secondsToHoursMinutesAndSecondsString(part.duration)}@${
              part.targetPower
            }% (${wattFromFtpPercent(part.targetPower, activeFtp)}W)`}
          </Text>
        );
      })}
      {status === 'finished' ? (
        <Text>DONE!</Text>
      ) : (
        <Text>{getTimeLeft(workout, partElapsedTime, activePart)}</Text>
      )}
    </Stack>
  );
};

const getTimeLeft = (
  workout: Workout,
  partElapsedTime: number,
  activePart: number
): string => {
  const totalWorkoutTime = workout.parts.reduce(
    (acc, part) => acc + part.duration,
    0
  );

  const timeElapsed =
    partElapsedTime +
    workout.parts.reduce(
      (acc, part, ind) => (ind < activePart ? acc + part.duration : acc),
      0
    );

  return secondsToHoursMinutesAndSecondsString(totalWorkoutTime - timeElapsed);
};
