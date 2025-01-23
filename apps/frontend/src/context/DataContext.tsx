import * as React from 'react';
import { DataPoint } from '../types';
import { distanceToCoordinates } from '../utils/gps';
import { getPowerToSpeedMap } from '@dundring/utils';
import { useActiveWorkout } from './ActiveWorkoutContext';
import { useHeartRateMonitor } from './HeartRateContext';
import { useLogs } from './LogContext';
import { useSmartTrainer } from './SmartTrainerContext';
import { useWebsocket } from './WebsocketContext';
import { addElapsedTime, db, setMaxHeartRate, WorkoutDataPoint } from '../db';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { useActiveRoute } from '../hooks/useActiveRoute';

type TrainerState = 'not_started' | 'running' | 'paused';

const DataContext = React.createContext<{
  graphData: DataPoint[];
  trackedData: DataPoint[];
  hasValidData: boolean;
  timeElapsed: number;
  distance: number;
  maxHeartRate: number | null;
  speed: number;
  start: () => void;
  stop: () => void;
  addLap: () => void;
  state: TrainerState;
  isRunning: boolean;
  smoothedPower: number;
} | null>(null);

interface Props {
  clockWorker: Worker;
  children: React.ReactNode;
}

export const DataContextProvider = ({ clockWorker, children }: Props) => {
  const {
    syncResistance,
    start: startActiveWorkout,
    increaseElapsedTime: increaseActiveWorkoutElapsedTime,
  } = useActiveWorkout();

  const { sendData } = useWebsocket();
  const {
    state: workoutState,
    trackedData,
    graphData,
    lastDatapoint,
  } = useWorkoutState();
  const { activeRoute } = useActiveRoute();
  const [state, setState] = React.useState<TrainerState>('not_started');
  const isRunning = state === 'running';

  const { logEvent } = useLogs();
  const {
    isConnected: smartTrainerIsConnected,
    setResistance,
    power,
    cadence,
  } = useSmartTrainer();

  const { heartRate } = useHeartRateMonitor();

  const hasValidData = trackedData.length > 0;
  const dataTick = React.useCallback(
    (
      delta: number,
      data: {
        heartRate: number | null;
        power: number | null;
        cadence: number | null;
      }
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
      const deltaDistance = isRunning ? (speed * delta) / 1000 : 0;

      const accumulatedDistance = lastDatapoint?.accumulatedDistance ?? 0;
      const totalDistance = accumulatedDistance + deltaDistance;
      const coordinates = distanceToCoordinates(
        activeRoute.waypoints,
        totalDistance
      );

      db.workoutDataPoint.add({
        ...dataPoint,
        timestamp: new Date(),
        deltaTime: delta,
        deltaDistance,
        workoutNumber: workoutState.workoutNumber,
        lapNumber: workoutState.lapNumber,
        tracking: isRunning,
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
      const maxHeartRate = workoutState.maxHeartRate ?? 0;

      if (maxHeartRate < heartRate) {
        setMaxHeartRate(heartRate);
      }
      sendData(dataPoint);
    },
    [heartRate, power, cadence, isRunning, workoutState]
  );
  const clockTick = (delta: number) => {
    addElapsedTime(delta);

    increaseActiveWorkoutElapsedTime(delta);
  };
  React.useEffect(() => {
    if (clockWorker === null) return;

    clockWorker.onmessage = ({
      data,
    }: MessageEvent<{ type: string; delta: number }>) => {
      if (!data) return;
      switch (data.type) {
        case 'clockTick': {
          clockTick(data.delta);
          break;
        }
        case 'dataTick': {
          dataTick(data.delta, { heartRate, power, cadence });
        }
      }
    };
    clockWorker.onerror = (e) => console.log('message recevied:', e);

    return () => {
      clockWorker.onerror = null;
      clockWorker.onmessage = null;
    };
  }, [power, heartRate, cadence]);

  const start = React.useCallback(async () => {
    if (trackedData.length > 0) {
      logEvent('workout started');
    } else {
      logEvent('workout resumed');
      syncResistance();
    }

    startActiveWorkout();
    clockWorker.postMessage('startClockTimer');
    setState('running');
  }, [
    clockWorker,
    logEvent,
    syncResistance,
    startActiveWorkout,
    trackedData.length,
  ]);

  const stop = React.useCallback(async () => {
    logEvent('workout paused');
    setState('paused');
    if (smartTrainerIsConnected) {
      setResistance(0);
    }

    clockWorker.postMessage('stopClockTimer');
  }, [clockWorker, smartTrainerIsConnected, setResistance]);

  return (
    <DataContext.Provider
      value={{
        graphData,
        trackedData,
        hasValidData,
        timeElapsed: workoutState.elapsedTime,
        distance: lastDatapoint?.accumulatedDistance ?? 0,
        speed: lastDatapoint?.speed ?? 0,
        start,
        stop,
        addLap: () => {
          db.workoutState.add({
            ...workoutState,
            lapNumber: (workoutState?.lapNumber ?? 0) + 1,
            workoutNumber: workoutState?.workoutNumber ?? 0,
          });
        },
        state,
        isRunning,
        smoothedPower: getSmoothedPower(trackedData),
        maxHeartRate: workoutState.maxHeartRate || null,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = React.useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataContextProvider');
  }
  return context;
};

const getSmoothedPower = (datapoints: WorkoutDataPoint[]) => {
  const point1 = datapoints.at(-1)?.power || 0;
  const point2 = datapoints.at(-2)?.power || 0;
  const point3 = datapoints.at(-3)?.power || 0;

  const sum = point1 + point2 + point3;
  const len = Math.sign(point1) + Math.sign(point2) + Math.sign(point3);
  if (len === 0) {
    return 0;
  }
  return Math.round(sum / len);
};
