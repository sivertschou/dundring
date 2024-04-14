import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  defaultWorkoutState,
  initWorkoutstate,
  startNewWorkout,
} from '../db';
import { useEffect, useState } from 'react';
import { millisToHoursMinutesAndSeconds } from '@dundring/utils';

let hasPreCalculated = false;
export const numberOfGraphDataPoints = 500;
export const useWorkoutState = () => {
  const [showRecoverPrompt, setShowRecoverPrompt] = useState(false);

  const state =
    useLiveQuery(() => db.workoutState.limit(1).last()) ?? defaultWorkoutState;

  const trackedData =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where('workoutNumber')
          .equals(state.workoutNumber)
          .reverse()
          .toArray(),
      [state.workoutNumber]
    )
      ?.toReversed()
      ?.filter((dataPoint) => dataPoint.tracking) ?? [];

  const graphData =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where('workoutNumber')
          .equals(state.workoutNumber)
          .reverse()
          .limit(numberOfGraphDataPoints)
          .toArray(),
      [state.workoutNumber]
    )?.toReversed() ?? [];

  const firstDatapoint =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where('workoutNumber')
          .equals(state.workoutNumber)
          .and((dataPoint) => dataPoint.tracking)
          .first(),
      [state.workoutNumber]
    ) ?? null;

  const lastDatapoint =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where('workoutNumber')
          .equals(state.workoutNumber)
          .and((dataPoint) => dataPoint.tracking)
          .last(),
      [state.workoutNumber]
    ) ?? null;

  useEffect(() => {
    if (lastDatapoint && !hasPreCalculated) {
      const time = millisToHoursMinutesAndSeconds(
        Date.now() - lastDatapoint.timestamp.getTime()
      );
      if (time.hours < 12) {
        setShowRecoverPrompt(true);
      } else {
        startNewWorkout();
      }
      hasPreCalculated = true;
    }
  }, [lastDatapoint]);

  useEffect(() => {
    initWorkoutstate();
  }, []);

  return {
    state,
    graphData,
    trackedData,
    firstDatapoint,
    lastDatapoint,
    showRecoverPrompt,
    setShowRecoverPrompt,
  };
};
