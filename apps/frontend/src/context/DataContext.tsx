import * as React from 'react';
import { DataPoint, Lap, Waypoint } from '../types';
import { distanceToCoordinates } from '../utils/gps';
import { getPowerToSpeedMap } from '../utils/speed';
import { useActiveWorkout } from './ActiveWorkoutContext';
import { useHeartRateMonitor } from './HeartRateContext';
import { useLogs } from './LogContext';
import { useSmartTrainer } from './SmartTrainerContext';
import { useWebsocket } from './WebsocketContext';

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
  activeRoute: Waypoint[];
  activeRouteName: Route;
  setActiveRoute: (route: Route) => void;
} | null>(null);

type Route = 'zap' | 'D';

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

type Point = { lon: number; lat: number };

const haversine = (pointA: Point, pointB: Point) => {
  const R = 6371.0; // Earth radius in kilometers

  // Differences between latitudes and longitudes
  const dLat = toRadians(pointB.lat) - toRadians(pointA.lat);
  const dLon = toRadians(pointB.lon) - toRadians(pointA.lon);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pointA.lat)) *
      Math.cos(toRadians(pointB.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

export const zap: Waypoint[] = [
  { lon: 10.6590337, lat: 59.90347154, distance: 2400 },
  { lon: 10.64085992, lat: 59.88396124, distance: 600 },
  { lon: 10.65213867, lat: 59.88389387, distance: 2000 },
  { lon: 10.64629091, lat: 59.86610453, distance: 2400 },
  { lon: 10.6644647, lat: 59.88561483, distance: 600 },
  { lon: 10.65318595, lat: 59.8856822, distance: 2000 },
];

export const dStartPoint = { lon: 10.156904, lat: 58.218246 };
export const dScale = 20000;
export const dRaw: Waypoint[] =
  'M52.441,6.944L6.944,99.757L65.483,98.602L41.535,266.697L194.534,96.048L145.952,97.005L162.132,58.67L233.957,60.637L286.632,70.238L321.687,84.921L343.785,103.523L353.971,123.439L355.695,136.82L352.395,155.383L340.667,173.874L316.104,191.846L279.854,205.146L242.113,211.914L199.121,214.592L115.318,214.647L68.661,266.697L233.957,265.55L292.804,259.597L347.319,247.755L390.832,231.15L426.372,208.159L447.79,183.522L458.152,159.53L460.969,137.141L456.411,108.765L443.483,84.096L421.917,61.994L386.125,40.317L340.331,23.913L300.784,15.296L263.649,10.335L209.737,7.141L52.441,6.944Z'
    .split(/M|L|Z/)
    .filter((v) => !!v)
    .map((pair) => {
      const [x, y] = pair.split(',');
      return { x: parseFloat(x) / dScale, y: parseFloat(y) / dScale };
    })
    .map(({ x, y }) => ({
      lon: x + dStartPoint.lon,
      lat: -y + dStartPoint.lat,
    }))
    .map((point, index, arr) => ({
      ...point,
      distance: haversine(point, arr[(index + 1) % arr.length]) * 1000,
    }));

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
              laps: [{ dataPoints: [], distance: 0 }],
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
            laps: [...currentData.laps, { dataPoints: [], distance: 0 }],
          };
        }
        case 'ADD_DATA': {
          const laps = currentData.laps;
          const { dataPoint } = action;
          const currentLap = laps[laps.length - 1];

          if (currentData.state !== 'running') {
            return {
              ...currentData,
              untrackedData: [...currentData.untrackedData, dataPoint],
              laps: currentLap
                ? [
                    ...laps.filter((_, i) => i !== laps.length - 1),
                    {
                      dataPoints: [
                        ...currentLap.dataPoints,
                        { timeStamp: dataPoint.timeStamp },
                      ],
                      distance: currentLap.distance,
                    },
                  ]
                : [],
            };
          }

          const weight = 80;
          const powerSpeed = getPowerToSpeedMap(weight);
          const speed = dataPoint.power ? powerSpeed[dataPoint.power] : 0;

          const deltaDistance = (speed * action.delta) / 1000;

          const totalDistance = currentData.distance + deltaDistance;
          const coordinates = distanceToCoordinates(
            route === 'D' ? dRaw : zap,
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
        activeRoute: route === 'zap' ? zap : dRaw,
        activeRouteName: route === 'zap' ? 'zap' : 'D',
        setActiveRoute: setRoute,
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
