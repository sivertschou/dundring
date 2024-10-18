import { Text, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { useActiveWorkoutSession } from '../context/ActiveWorkoutSessionContext';
import { useData } from '../context/DataContext';
import { Workout } from '../types';
import { wattFromFtpPercent } from '../utils/general';
import {
  getTotalWorkoutTime,
  secondsToHoursMinutesAndSecondsString,
} from '@dundring/utils';

export const WorkoutDisplay = () => {
  const { activeWorkoutSession, activeFtp, changeActivePart } =
    useActiveWorkoutSession();
  const { addLap } = useData();
  if (!activeWorkoutSession.workout) {
    return null;
  }

  const { activePart, status, partElapsedTime, workout } = activeWorkoutSession;

  return (
    <Stack fontSize="sm">
      <Text>{workout.name}</Text>
      <Text>Based on {activeFtp}W FTP</Text>
      <Text>{secondsToHoursMinutesAndSecondsString(partElapsedTime)}</Text>
      {workout.parts.map((part, i) => {
        const isActive = status === 'active' && i === activePart;
        const targetPowerText =
          part.targetPower > 0
            ? `${part.targetPower}% (${wattFromFtpPercent(part.targetPower, activeFtp)}W)`
            : 'Free mode';

        return (
          <Text
            key={i}
            fontWeight={isActive ? 'bold' : 'normal'}
            color={isActive ? 'purple.500' : ''}
            cursor="pointer"
            onClick={() => changeActivePart(i, addLap)}
          >
            {`${secondsToHoursMinutesAndSecondsString(part.duration)}@${targetPowerText}`}
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
  const totalWorkoutTime = getTotalWorkoutTime(workout);

  const timeElapsed =
    partElapsedTime +
    workout.parts.reduce(
      (acc, part, ind) => (ind < activePart ? acc + part.duration : acc),
      0
    );

  return secondsToHoursMinutesAndSecondsString(totalWorkoutTime - timeElapsed);
};
