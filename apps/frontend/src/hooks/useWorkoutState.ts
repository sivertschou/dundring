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

  const lapData =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where({
            workoutNumber: state.workoutNumber,
            lapNumber: state.lapNumber,
          })
          .filter((datapoint) => datapoint.tracking)
          .toArray(),
      [state.workoutNumber, state.lapNumber]
    ) ?? [];

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

  const lastUntrackedDatapoint =
    useLiveQuery(
      () =>
        db.workoutDataPoint
          .where('workoutNumber')
          .equals(state.workoutNumber)
          .and((dataPoint) => !dataPoint.tracking)
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
    lapData,
    firstDatapoint,
    lastDatapoint,
  };
};
