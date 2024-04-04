import Dexie, { Table } from 'dexie';
import { Waypoint } from './types';
import { Route } from './gps';

export type WorkoutDataPoint = {
  id?: number;
  workoutNumber: number;
  lapNumber: number;
  accumulatedDistance: number;
  timestamp: Date;
  tracking: boolean;
  heartRate?: number;
  power?: number;
  cadence?: number;
  position?: Waypoint;
  speed?: number;
};

export type WorkoutState = {
  workoutNumber: number;
  lapNumber: number;
  elapsedTime: number;
  route: Route;
};

export class DundringDexie extends Dexie {
  workoutDataPoint!: Table<WorkoutDataPoint>;
  workoutState!: Table<WorkoutState>;

  constructor() {
    super('dundring');
    this.version(1).stores({
      workoutDataPoint:
        '++id, workoutNumber, lapNumber, timestamp, tracking, heartRate, power, cadence, position, speed, accumulatedDistance',
      workoutState: '++workoutNumber, lapNumber, route',
    });
  }
}

export const db = new DundringDexie();

export const defaultWorkoutState: WorkoutState = {
  workoutNumber: 0,
  lapNumber: 0,
  elapsedTime: 0,
  route: 'D',
};

export const startNewWorkout = async () => {
  db.transaction('rw', db.workoutState, async () => {
    const state =
      (await db.workoutState.toCollection().last()) ?? defaultWorkoutState;

    await db.workoutState.add({
      ...state,
      workoutNumber: state.workoutNumber + 1,
      lapNumber: 0,
    });
  });
};

export const addElapsedTime = async (delta: number) => {
  db.transaction('rw', db.workoutState, async () => {
    const state =
      (await db.workoutState.toCollection().last()) ?? defaultWorkoutState;

    await db.workoutState.update(state.workoutNumber, {
      elapsedTime: state.elapsedTime + delta,
    });
  });
};

export const initWorkoutstate = async () => {
  db.transaction('rw', db.workoutState, async () => {
    const state = await db.workoutState.toCollection().last();

    if (!state) {
      await db.workoutState.add(defaultWorkoutState);
    }
  });
};

export const setRoute = async (route: Route) => {
  db.transaction('rw', db.workoutState, async () => {
    const state =
      (await db.workoutState.toCollection().last()) ?? defaultWorkoutState;

    await db.workoutState.update(state.workoutNumber, {
      route,
    });
  });
};
