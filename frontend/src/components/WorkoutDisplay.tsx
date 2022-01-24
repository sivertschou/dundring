import { Text, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { useData } from '../context/DataContext';
import { Workout } from '../types';
import {
  secondsToHoursMinutesAndSecondsString,
  wattFromFtpPercent,
} from '../utils';

export const WorkoutDisplay = () => {
  const { activeWorkout, activeFTP, changeActivePart } = useActiveWorkout();
  const { addLap } = useData();
  if (!activeWorkout.workout) {
    return null;
  }

  const { activePart, status, partElapsedTime, workout } = activeWorkout;

  return (
    <Stack fontSize="sm">
      <Text>{workout.name}</Text>
      <Text>Based on {activeFTP}W FTP</Text>
      <Text>{secondsToHoursMinutesAndSecondsString(partElapsedTime)}</Text>
      {workout.parts.map((part, i) => {
        const isActive =
          status !== 'finished' && status !== 'not_started' && i === activePart;
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
            }% (${wattFromFtpPercent(part.targetPower, activeFTP)}W)`}
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
