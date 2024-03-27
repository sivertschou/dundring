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
