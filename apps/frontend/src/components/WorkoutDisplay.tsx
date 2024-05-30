import { Text, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { useData } from '../context/DataContext';
import { Workout, WorkoutPartBase } from '../types';
import { wattFromFtpPercent } from '../utils/general';
import {
  getTotalWorkoutTime,
  secondsToHoursMinutesAndSecondsString,
} from '@dundring/utils';

export const WorkoutDisplay = () => {
  const { activeWorkout, activeFtp, changeActivePart } = useActiveWorkout();
  const { addLap } = useData();
  if (!activeWorkout.workout) {
    return null;
  }

  const { activePart, status, partElapsedTime, workout } = activeWorkout;

  const grouped = groupByPart(workout.baseParts);

  const activeBasePart = workout.baseParts[activePart];

  return (
    <Stack fontSize="sm">
      <Text>{workout.name}</Text>
      <Text>Based on {activeFtp}W FTP</Text>
      <Text>{secondsToHoursMinutesAndSecondsString(partElapsedTime)}</Text>
      {grouped.map((group) => {
        const { part, partIndex, index } = group[0];

        const partIsActive =
          status === 'active' && activeBasePart.partIndex == partIndex;

        //HENTE FRA GROUP?

        const displayWorkoutPart = () => {
          switch (part.type) {
            case 'steady':
              return (
                <Text
                  key={partIndex}
                  fontWeight={partIsActive ? 'bold' : 'normal'}
                  color={partIsActive ? 'purple.500' : ''}
                  cursor="pointer"
                  onClick={() => changeActivePart(index, addLap)}
                >
                  {secondsToHoursMinutesAndSecondsString(part.duration)}@
                  {part.targetPower}% (
                  {wattFromFtpPercent(part.targetPower, activeFtp)}W)
                </Text>
              );
            case 'interval':
              const curPart = activeBasePart.part;
              let onPartActive =
                partIsActive &&
                curPart.type === 'interval' &&
                curPart.internalIndex === 0;
              let offPartActive =
                partIsActive &&
                curPart.type === 'interval' &&
                curPart.internalIndex === 1;

              const onIndex = onPartActive
                ? activePart
                : offPartActive
                  ? activePart - 1
                  : index;
              const offIndex = offPartActive
                ? activePart
                : onPartActive
                  ? activePart + 1
                  : index;
              const intervalNumberPart =
                partIsActive && curPart.type === 'interval'
                  ? `${curPart.repeatNumber} of`
                  : '';
              return (
                <>
                  <Text
                    key={partIndex}
                    fontWeight={partIsActive ? 'bold' : 'normal'}
                    color={partIsActive ? 'purple.500' : ''}
                    cursor="pointer"
                    onClick={() => changeActivePart(onIndex, addLap)}
                  >
                    Interval: {intervalNumberPart} #{part.repeats}
                  </Text>
                  <Text
                    key={partIndex}
                    fontWeight={onPartActive ? 'bold' : 'normal'}
                    color={partIsActive ? 'purple.500' : ''}
                    cursor="pointer"
                    onClick={() => changeActivePart(onIndex, addLap)}
                  >
                    On: {secondsToHoursMinutesAndSecondsString(part.onDuration)}
                    @{part.onTargetPower}% (
                    {wattFromFtpPercent(part.onTargetPower, activeFtp)}W)
                  </Text>
                  <Text
                    key={partIndex}
                    fontWeight={offPartActive ? 'bold' : 'normal'}
                    color={partIsActive ? 'purple.500' : ''}
                    cursor="pointer"
                    onClick={() => changeActivePart(offIndex, addLap)}
                  >
                    Off:{' '}
                    {secondsToHoursMinutesAndSecondsString(part.offDuration)}@
                    {part.offTargetPower}% (
                    {wattFromFtpPercent(part.offTargetPower, activeFtp)}W)
                  </Text>
                </>
              );
          }
        };

        return displayWorkoutPart();
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

const groupByPart = (
  workoutParts: Array<WorkoutPartBase>
): Array<Array<WorkoutPartBase>> => {
  const groupedParts = new Array<Array<WorkoutPartBase>>();
  workoutParts.forEach((part) => {
    const cur = groupedParts[part.partIndex];
    if (cur === undefined) {
      groupedParts[part.partIndex] = [part];
    } else {
      groupedParts[part.partIndex] = [...cur, part];
    }
  });
  return groupedParts;
};
