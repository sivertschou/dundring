import Dexie, { Table } from 'dexie';
import { Waypoint } from './types';

type WorkoutDataPoint = {
  id?: number;
  workoutNumber: number;
  lapNumber: number;
  timestamp: Date;
  heartRate?: number;
  power?: number;
  cadence?: number;
  position?: Waypoint;
};

export class DundringDexie extends Dexie {
  workoutDataPoint!: Table<WorkoutDataPoint>;

  constructor() {
    super('dundring');
    this.version(1).stores({
      workoutDataPoint:
        '++id, workoutNumber, lapNumber, timestamp, heartRate, power, cadence, position',
    });
  }
}

export const db = new DundringDexie();
