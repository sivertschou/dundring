import { useLiveQuery } from 'dexie-react-hooks';
import { WorkoutState, db } from '../db';

const defaultWorkoutState: WorkoutState = { workoutNumber: 0, lapNumber: 0 };
export const useWorkoutState = () => {
  const state = useLiveQuery(() => db.workoutState.limit(1).last());

  return {
    workoutState: state ?? defaultWorkoutState,
  };
};
