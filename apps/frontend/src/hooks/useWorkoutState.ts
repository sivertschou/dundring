import { useLiveQuery } from 'dexie-react-hooks';
import {
  createNewWorkoutIfOldData,
  db,
  defaultWorkoutState,
  initWorkoutstate,
} from '../db';
import { useEffect } from 'react';

export const numberOfGraphDataPoints = 500;
export const useWorkoutState = () => {
  const state =
    useLiveQuery(() => db.workoutState.limit(1).last()) ?? defaultWorkoutState;

  const trackedData =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where('workoutNumber')
          .equals(state.workoutNumber)
          .and((datapoint) => datapoint.tracking)
          .toArray(),
      [state.workoutNumber]
    ) ?? [];

  const lapData =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where(['workoutNumber', 'lapNumber'])
          .equals([state.workoutNumber, state.lapNumber])
          .and((datapoint) => datapoint.tracking)
          .toArray(),
      [state.workoutNumber, state.lapNumber]
    ) ?? [];

  const graphData =
    useLiveQuery(
      async () =>
        (
          await db.workoutDataPoint
            .where('workoutNumber')
            .equals(state.workoutNumber)
            .reverse()
            .limit(numberOfGraphDataPoints)
            .toArray()
        ).toReversed(),
      [state.workoutNumber]
    ) ?? [];

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
    createNewWorkoutIfOldData();
  }, []);

  useEffect(() => {
    initWorkoutstate();
  }, []);

  return {
    state,
    graphData,
    trackedData,
    lapData,
    firstDatapoint,
    lastDatapoint,
  };
};
