import Dexie, { Table, UpdateSpec } from 'dexie';
import { Waypoint } from './types';
import { Route, routeNameToWaypoint } from './gps';
import {
  getPowerToSpeedMap,
  millisToHoursMinutesAndSeconds,
} from '@dundring/utils';
import { distanceToCoordinates } from './utils/gps';

export type WorkoutDataPoint = {
  id?: number;
  workoutNumber: number;
  lapNumber: number;
  accumulatedDistance: number;
  timestamp: Date;
  deltaTime: number;
  deltaDistance: number;
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
  maxHeartRate: number | null;
  route: Route;
  hasValidData: boolean;
};

export class DundringDexie extends Dexie {
  workoutDataPoint!: Table<WorkoutDataPoint>;
  workoutState!: Table<WorkoutState>;

  constructor() {
    super('dundring');
    this.version(1).stores({
      workoutDataPoint:
        '++id, workoutNumber, lapNumber, timestamp, tracking, heartRate, power, cadence, position, speed, accumulatedDistance, [workoutNumber+lapNumber]',
      workoutState: '++workoutNumber, lapNumber, route',
    });
  }
}

export const db = new DundringDexie();

export const defaultWorkoutState: WorkoutState = {
  workoutNumber: 0,
  lapNumber: 0,
  elapsedTime: 0,
  maxHeartRate: null,
  route: 'zap',
  hasValidData: false,
};

export const startNewWorkout = async () => {
  db.transaction('rw', db.workoutState, async () => {
    const state =
      (await db.workoutState.toCollection().last()) ?? defaultWorkoutState;

    await db.workoutState.add({
      ...defaultWorkoutState,
      workoutNumber: state.workoutNumber + 1,
      route: state.route,
    });
  });
};

export const addLap = async () => {
  db.transaction('rw', db.workoutState, async () => {
    const state =
      (await db.workoutState.orderBy('workoutNumber').last()) ??
      defaultWorkoutState;

    const lapNumber = state.lapNumber + 1;
    await db.workoutState.update(state.workoutNumber, {
      lapNumber,
    });
  });
};

const getLastDatapoint: () => Promise<WorkoutDataPoint | null> = async () => {
  const state =
    (await db.workoutState.orderBy('workoutNumber').last()) ??
    defaultWorkoutState;

  return (
    (await db.workoutDataPoint
      .where('workoutNumber')
      .equals(state.workoutNumber)
      .filter((item) => item.tracking)
      .last()) ?? null
  );
};

const getWorkoutState = async () => {
  return (await db.workoutState.toCollection().last()) ?? defaultWorkoutState;
};

export const addDatapoint = async (
  delta: number,
  data: {
    heartRate: number | null;
    power: number | null;
    cadence: number | null;
  },
  isTracking: boolean,
  hasValidData: boolean
) => {
  const heartRateToInclude = data.heartRate
    ? { heartRate: data.heartRate }
    : {};
  const powerToInclude = data.power ? { power: data.power } : {};
  const cadenceToInclude = data.cadence ? { cadence: data.cadence } : {};
  const dataPoint = {
    timestamp: new Date(),
    ...heartRateToInclude,
    ...powerToInclude,
    ...cadenceToInclude,
  };

  const weight = 80;
  const powerSpeed = getPowerToSpeedMap(weight);
  const speed = dataPoint.power ? powerSpeed(dataPoint.power) : 0;
  const deltaDistance = isTracking ? (speed * delta) / 1000 : 0;

  return db.transaction(
    'rw',
    db.workoutDataPoint,
    db.workoutState,
    async () => {
      const lastDatapoint = await getLastDatapoint();
      const workoutState = await getWorkoutState();

      const routeWaypoints = routeNameToWaypoint(workoutState.route);

      const accumulatedDistance = lastDatapoint?.accumulatedDistance ?? 0;
      const totalDistance = accumulatedDistance + deltaDistance;

      const coordinates = distanceToCoordinates(routeWaypoints, totalDistance);

      db.workoutDataPoint.add({
        ...dataPoint,
        timestamp: new Date(),
        deltaTime: delta,
        deltaDistance,
        workoutNumber: workoutState.workoutNumber,
        lapNumber: workoutState.lapNumber,
        tracking: isTracking,
        accumulatedDistance: totalDistance,
        speed,
        position: coordinates
          ? {
              lat: coordinates.lat,
              lon: coordinates.lon,
              deltaDistance,
            }
          : undefined,
      });
      const heartRate = dataPoint.heartRate ?? 0;
      const currentMaxHeartRate = workoutState.maxHeartRate ?? 0;

      const newMax = heartRate > currentMaxHeartRate ? { heartRate } : {};
      const newHasValidData =
        isTracking && !hasValidData ? { hasValidData: true } : {};
      if (newMax !== null || newHasValidData || null) {
        await updateWorkoutState(workoutState.workoutNumber, {
          ...newMax,
          ...newHasValidData,
        });
      }
    }
  );
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

const updateWorkoutState = async (
  workoutNumber: number,
  changes: UpdateSpec<WorkoutState> // Basically a Partial WorkoutState
) => {
  await db.workoutState.update(workoutNumber, changes);
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

const hoursToRecoverWorkout = 12;
export const createNewWorkoutIfOldData = async () => {
  return await db.transaction(
    'rw',
    db.workoutDataPoint,
    db.workoutState,
    async () => {
      const lastTrackedDatapoint = await getLastDatapoint();

      if (lastTrackedDatapoint) {
        const time = millisToHoursMinutesAndSeconds(
          Date.now() - lastTrackedDatapoint.timestamp.getTime()
        );

        if (time.hours >= hoursToRecoverWorkout) {
          startNewWorkout();
        }
      }
    }
  );
};

export const getTrackedData: () => Promise<WorkoutDataPoint[]> = async () => {
  const state = await db.workoutState.toCollection().last();

  return db.workoutDataPoint
    .where('workoutNumber')
    .equals(state?.workoutNumber ?? 0)
    .filter((datapoint) => datapoint.tracking)
    .toArray();
};
