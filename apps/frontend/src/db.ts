import Dexie, { Table } from 'dexie';
import { Waypoint } from './types';

export type WorkoutDataPoint = {
  id?: number;
  workoutNumber: number;
  lapNumber: number;
  timestamp: Date;
  tracking: boolean;
  heartRate?: number;
  power?: number;
  cadence?: number;
  position?: Waypoint;
};

export type WorkoutState = {
  workoutNumber: number;
  lapNumber: number;
};

export class DundringDexie extends Dexie {
  workoutDataPoint!: Table<WorkoutDataPoint>;
  workoutState!: Table<WorkoutState>;

  constructor() {
    super('dundring');
    this.version(1).stores({
      workoutDataPoint:
        '++id, workoutNumber, lapNumber, timestamp, tracking, heartRate, power, cadence, position',
      workoutState: '++workoutNumber, lapNumber',
    });
  }
}

export const db = new DundringDexie();

export const defaultWorkoutState: WorkoutState = {
  workoutNumber: 0,
  lapNumber: 0,
};

export const startNewWorkout = async () => {
  db.transaction('rw', db.workoutState, async () => {
    const state =
      (await db.workoutState.orderBy('workoutNumber').reverse().first()) ??
      defaultWorkoutState;

    await db.workoutState.add({
      workoutNumber: state.workoutNumber + 1,
      lapNumber: 0,
    });
  });
};
