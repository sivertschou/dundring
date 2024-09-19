import * as React from 'react';
import { DataPoint, Lap, Waypoint } from '../types';
import { distanceToCoordinates } from '../utils/gps';
import { getPowerToSpeedMap } from '@dundring/utils';
import { useActiveWorkout } from './ActiveWorkoutContext';
import { useHeartRateMonitor } from './HeartRateContext';
import { useLogs } from './LogContext';
import { useSmartTrainer } from './SmartTrainerContext';
import { useWebsocket } from './WebsocketContext';
import { Route, dWaypoints, routeNameToWaypoint, zapWaypoints } from '../gps';

const DataContext = React.createContext<{
  data: Lap[];
  untrackedData: DataPoint[];
  hasValidData: boolean;
  timeElapsed: number;
  startingTime: Date | null;
  distance: number;
  speed: number;
  start: () => void;
  stop: () => void;
  addLap: () => void;
  isRunning: boolean;
  activeRoute: { name: Route; waypoints: Waypoint[] };
  setActiveRoute: (route: Route) => void;
  smoothedPower: number;
} | null>(null);

interface Props {
  clockWorker: Worker;
  children: React.ReactNode;
}

interface Data {
  laps: Lap[];
  untrackedData: DataPoint[];
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
  const [route, setRoute] = React.useState<Route>('zap');

  const [data, dispatch] = React.useReducer(
    (currentData: Data, action: Action): Data => {
      switch (action.type) {
        case 'START': {
          if (currentData.state === 'not_started') {
            return {
              laps: [
                {
                  dataPoints: [],
                  distance: 0,
                  sumWatt: 0,
                  normalizedDuration: 0,
                },
              ],
              untrackedData: currentData.untrackedData,
              timeElapsed: 0,
              distance: 0,
              speed: 0,
              startingTime: new Date(),
              state: 'running',
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
            laps: [
              ...currentData.laps,
              {
                dataPoints: [],
                distance: 0,
                sumWatt: 0,
                normalizedDuration: 0,
              },
            ],
          };
        }
        case 'ADD_DATA': {
          const { dataPoint, delta } = action;
          const laps = currentData.laps;
          const currentLap = laps[laps.length - 1];

          const pointAvgWatt = (dataPoint.power || 0) * delta;

          if (currentData.state !== 'running') {
            return {
              ...currentData,
              untrackedData: [...currentData.untrackedData, dataPoint],
              laps: currentLap
                ? [
                    ...laps.filter((_, i) => i !== laps.length - 1),
                    {
                      ...currentLap,
                      dataPoints: [
                        ...currentLap.dataPoints,
                        { timeStamp: dataPoint.timeStamp },
                      ],
                    },
                  ]
                : [],
            };
          }

          const weight = 80;
          const powerSpeed = getPowerToSpeedMap(weight);
          const speed = dataPoint.power ? powerSpeed(dataPoint.power) : 0;

          const deltaDistance = (speed * delta) / 1000;

          const totalDistance = currentData.distance + deltaDistance;
          const coordinates = distanceToCoordinates(
            route === 'D' ? dWaypoints : zapWaypoints,
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
          return {
            ...currentData,
            untrackedData: [
              ...currentData.untrackedData,
              { timeStamp: dataPoint.timeStamp },
            ],
            speed: speed,
            distance: currentData.distance + deltaDistance,
            laps: [
              ...laps.filter((_, i) => i !== laps.length - 1),
              {
                dataPoints: [...currentLap.dataPoints, dataPointWithPosition],
                distance: currentLap.distance + deltaDistance,
                sumWatt: currentLap.sumWatt + pointAvgWatt,
                normalizedDuration: dataPoint.power
                  ? currentLap.normalizedDuration + delta
                  : currentLap.normalizedDuration,
              },
            ],
          };
        }
      }
    },
    {
      laps: [],
      untrackedData: [],
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

  const hasValidData = data.laps.some((lap) =>
    lap.dataPoints.some((dataPoint) => dataPoint.heartRate || dataPoint.power)
  );

  React.useEffect(() => {
    if (clockWorker === null) return;

    clockWorker.onmessage = ({
      data,
    }: MessageEvent<{ type: string; delta: number }>) => {
      if (!data) return;
      switch (data.type) {
        case 'clockTick': {
          dispatch({ type: 'INCREASE_ELAPSED_TIME', delta: data.delta });
          increaseActiveWorkoutElapsedTime(data.delta, () =>
            dispatch({ type: 'ADD_LAP' })
          );
          break;
        }
        case 'dataTick': {
          const heartRateToInclude = heartRate ? { heartRate } : {};
          const powerToInclude = power ? { power } : {};
          const cadenceToInclude = cadence ? { cadence } : {};
          const dataPoint = {
            timeStamp: new Date(),
            ...heartRateToInclude,
            ...powerToInclude,
            ...cadenceToInclude,
          };
          dispatch({ type: 'ADD_DATA', dataPoint, delta: data.delta });
          sendData(dataPoint);
        }
      }
    };
    clockWorker.onerror = (e) => console.log('message recevied:', e);
  }, [
    clockWorker,
    power,
    heartRate,
    cadence,
    increaseActiveWorkoutElapsedTime,
    sendData,
  ]);

  const start = React.useCallback(async () => {
    if (!data.startingTime) {
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
    data.startingTime,
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
  }, [clockWorker, logEvent, smartTrainerIsConnected, setResistance, wakeLock]);

  return (
    <DataContext.Provider
      value={{
        data: data.laps,
        untrackedData: data.untrackedData,
        hasValidData,
        timeElapsed: data.timeElapsed,
        startingTime: data.startingTime,
        distance: data.distance,
        speed: data.speed,
        start,
        stop,
        addLap: () => dispatch({ type: 'ADD_LAP' }),
        isRunning: data.state === 'running',
        activeRoute: { name: route, waypoints: routeNameToWaypoint(route) },
        setActiveRoute: setRoute,
        smoothedPower: getSmoothedPower(data.laps),
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

const getSmoothedPower = (laps: Lap[]) => {
  const lap = laps.at(-1);
  if (!lap) {
    return 0;
  }
  const point1 = lap.dataPoints.at(-1)?.power || 0;
  const point2 = lap.dataPoints.at(-2)?.power || 0;
  const point3 = lap.dataPoints.at(-3)?.power || 0;

  const sum = point1 + point2 + point3;
  const len = Math.sign(point1) + Math.sign(point2) + Math.sign(point3);
  if (len === 0) {
    return 0;
  }
  return Math.round(sum / len);
};
