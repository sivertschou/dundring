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

const DataContext = React.createContext<{
  graphData: DataPoint[];
  trackedData: DataPoint[];
  hasValidData: boolean;
  timeElapsed: number;
  startingTime: Date | null;
  distance: number;
  speed: number;
  start: () => void;
  stop: () => void;
  addLap: () => void;
  isRunning: boolean;
  state: 'not_started' | 'running' | 'paused';
} | null>(null);

interface Props {
  clockWorker: Worker;
  children: React.ReactNode;
}

interface Data {
  lap: number;
  workoutNumber: number;
  timeElapsed: number;
  distance: number;
  speed: number;
  startingTime: Date | null;
  state: 'not_started' | 'running' | 'paused';
}

interface AddData {
  type: 'ADD_DATA';
  dataPoint: DataPoint;
  delta: number;
}

interface AddLap {
  type: 'ADD_LAP';
}
interface IncreaseElapsedTime {
  type: 'INCREASE_ELAPSED_TIME';
  delta: number;
}
interface Pause {
  type: 'PAUSE';
}
interface Start {
  type: 'START';
}
type Action = AddData | AddLap | IncreaseElapsedTime | Start | Pause;

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

  const [state, dispatch] = React.useReducer(
    (currentData: Data, action: Action): Data => {
      switch (action.type) {
        case 'START': {
          if (currentData.state === 'not_started') {
            return {
              timeElapsed: 0,
              distance: 0,
              speed: 0,
              startingTime: new Date(),
              state: 'running',
              lap: 0,
              workoutNumber: 0,
            };
          }
          return { ...currentData, state: 'running' };
        }
        case 'PAUSE': {
          return { ...currentData, state: 'paused' };
        }
        case 'INCREASE_ELAPSED_TIME': {
          return {
            ...currentData,
            timeElapsed: currentData.timeElapsed + action.delta,
          };
        }
        case 'ADD_LAP': {
          return {
            ...currentData,
          };
        }
        case 'ADD_DATA': {
          const { dataPoint } = action;

          const weight = 80;
          const powerSpeed = getPowerToSpeedMap(weight);
          const speed = dataPoint.power ? powerSpeed[dataPoint.power] : 0;

          const deltaDistance = (speed * action.delta) / 1000;

          const totalDistance = currentData.distance + deltaDistance;
          const coordinates = distanceToCoordinates(
            activeRoute.waypoints,
            totalDistance
          );

          const dataPointWithPosition: DataPoint = {
            ...dataPoint,
            ...(coordinates
              ? {
                  position: {
                    lat: coordinates.lat,
                    lon: coordinates.lon,
                    distance: totalDistance,
                  },
                }
              : undefined),
          };

          // db.workoutDataPoint.add({
          //   ...dataPointWithPosition,
          //   workoutNumber: 1,
          //   lapNumber: 1,
          //   tracking: true,
          // });

          return {
            ...currentData,
            speed: speed,
            distance: currentData.distance + deltaDistance,
          };
        }
      }
    },
    {
      lap: 0,
      workoutNumber: 0,
      timeElapsed: 0,
      distance: 0,
      speed: 0,
      startingTime: null,
      state: 'not_started',
    }
  );

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

      const deltaDistance =
        state.state === 'running' ? (speed * delta) / 1000 : 0;

      const accumulatedDistance = lastDatapoint?.accumulatedDistance ?? 0;
      const totalDistance = accumulatedDistance + deltaDistance;
      const coordinates = distanceToCoordinates(
        activeRoute.waypoints,
        totalDistance
      );

      // db.workoutDataPoint.add({
      //   timestamp: new Date(),
      //   workoutNumber: 1,
      //   lapNumber: 1,
      //   tracking: true,
      // });
      // dispatch({ type: 'ADD_DATA', dataPoint, delta });

      console.log(
        'state:',
        state.state,
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
        tracking: state.state === 'running',
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
    [heartRate, power, cadence, state.state, workoutState]
  );
  const clockTick = (delta: number) => {
    dispatch({ type: 'INCREASE_ELAPSED_TIME', delta });
    addElapsedTime(delta);

    increaseActiveWorkoutElapsedTime(delta, () =>
      dispatch({ type: 'ADD_LAP' })
    );
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
    if (!state.startingTime) {
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
    dispatch({ type: 'START' });
  }, [
    clockWorker,
    logEvent,
    syncResistance,
    startActiveWorkout,
    state.startingTime,
  ]);

  const stop = React.useCallback(async () => {
    logEvent('workout paused');
    dispatch({ type: 'PAUSE' });
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
        startingTime: state.startingTime,
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
        isRunning: state.state === 'running',
        state: state.state,
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
