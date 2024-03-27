import { useLiveQuery } from 'dexie-react-hooks';
import { db, defaultWorkoutState } from '../db';

export const useWorkoutState = () => {
  const state = useLiveQuery(() => db.workoutState.limit(1).last());

  return {
    workoutState: state ?? defaultWorkoutState,
  };
};
