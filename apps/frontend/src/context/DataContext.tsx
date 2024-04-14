import * as React from 'react';
import { DataPoint } from '../types';
import { distanceToCoordinates } from '../utils/gps';
import { getPowerToSpeedMap } from '@dundring/utils';
import { useActiveWorkout } from './ActiveWorkoutContext';
import { useHeartRateMonitor } from './HeartRateContext';
import { useLogs } from './LogContext';
import { useSmartTrainer } from './SmartTrainerContext';
import { useWebsocket } from './WebsocketContext';
import { addElapsedTime, db } from '../db';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { useActiveRoute } from '../hooks/useActiveRoute';

type TrainerState = 'not_started' | 'running' | 'paused';
const DataContext = React.createContext<{
  graphData: DataPoint[];
  trackedData: DataPoint[];
  hasValidData: boolean;
  timeElapsed: number;
  distance: number;
  speed: number;
  start: () => void;
  stop: () => void;
  addLap: () => void;
  state: TrainerState;
  isRunning: boolean;
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

  const [wakeLock, setWakeLock] = React.useState<WakeLockSentinel | null>(null);
  const { logEvent } = useLogs();
  const {
    isConnected: smartTrainerIsConnected,
    setResistance,
    power,
    cadence,
  } = useSmartTrainer();

  const { heartRate } = useHeartRateMonitor();

  const hasValidData = false; /*data.laps.some((lap) =>
    lap.dataPoints.some((dataPoint) => dataPoint.heartRate || dataPoint.power)
  );*/

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
      console.log('powerSpeedMap', powerSpeed);
      const speed = dataPoint.power ? powerSpeed[dataPoint.power] : 0;

      console.log(
        'speed:',
        speed,
        'dataPoint.power:',
        dataPoint.power,
        'power:',
        power
      );

      const deltaDistance = isRunning ? (speed * delta) / 1000 : 0;

      const accumulatedDistance = lastDatapoint?.accumulatedDistance ?? 0;
      const totalDistance = accumulatedDistance + deltaDistance;
      const coordinates = distanceToCoordinates(
        activeRoute.waypoints,
        totalDistance
      );

      console.log(
        'dataTick.dataPoint:',
        dataPoint,
        'coordinates:',
        coordinates,
        'distance:',
        deltaDistance
      );

      db.workoutDataPoint.add({
        ...dataPoint,
        timestamp: new Date(),
        workoutNumber: workoutState.workoutNumber,
        lapNumber: workoutState.lapNumber,
        tracking: isRunning,
        accumulatedDistance: totalDistance,
        speed,
        position: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          distance: deltaDistance,
        },
      });
      // sendData(dataPoint);
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
        case 'clockTick':
          clockTick(data.delta);
          break;
        case 'dataTick':
          dataTick(data.delta, { heartRate, power, cadence });
      }
    };
    clockWorker.onerror = (e) => console.log('message recevied:', e);

    return () => {
      clockWorker.onerror = null;
      clockWorker.onmessage = null;
    };
  }, [heartRate, power, cadence]);

  const start = React.useCallback(async () => {
    console.log('start.trackedData');
    if (trackedData.length > 0) {
      logEvent('workout started');
    } else {
      logEvent('workout resumed');
      syncResistance();
    }

    try {
      const wl = await navigator.wakeLock.request('screen');
      setWakeLock(wl);
    } catch (e) {
      console.warn('Could not acquire wakeLock');
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

    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }

    clockWorker.postMessage('stopClockTimer');
  }, [clockWorker, smartTrainerIsConnected, setResistance, wakeLock]);

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
