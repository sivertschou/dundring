import * as React from 'react';
import { DataPoint, Lap } from '../types';
import { useHeartRateMonitor } from './HeartRateContext';
import { useLogs } from './LogContext';
import { useSmartTrainer } from './SmartTrainerContext';
import { useWebsocket } from './WebsocketContext';
import { useActiveWorkout } from './WorkoutContext';

const DataContext = React.createContext<{
  data: Lap[];
  // setData: React.Dispatch<React.SetStateAction<Lap[]>>;
  hasValidData: boolean;
  timeElapsed: number;
  // setTimeElapsed: React.Dispatch<React.SetStateAction<number>>;
  startingTime: Date | null;
  // setStartingTime: React.Dispatch<React.SetStateAction<Date | null>>;
  start: () => void;
  stop: () => void;
  isRunning: boolean;
} | null>(null);

interface Props {
  clockWorker: Worker;
  children: React.ReactNode;
}

interface Data {
  laps: Lap[];
  graphData: DataPoint[];
  timeElapsed: number;
  startingTime: Date | null;
  state: 'not_started' | 'running' | 'paused';
}

interface AddData {
  type: 'ADD_DATA';
  dataPoint: DataPoint;
}
interface AddLap {
  type: 'ADD_LAP';
}
interface Pause {
  type: 'PAUSE';
}
interface Start {
  type: 'START';
}
type Action = AddData | AddLap | Start | Pause;

export const DataContextProvider = ({ clockWorker, children }: Props) => {
  const { syncResistance, start: startActiveWorkout } = useActiveWorkout();

  const { sendData } = useWebsocket();

  const [data, dispatch] = React.useReducer(
    (currentData: Data, action: Action): Data => {
      switch (action.type) {
        case 'START': {
          if (currentData.state === 'not_started') {
            return {
              laps: [{ dataPoints: [] as DataPoint[] }] as Lap[],
              graphData: [] as DataPoint[],
              timeElapsed: 0,
              startingTime: new Date(),
              state: 'running',
            };
          }
          return { ...currentData, state: 'running' };
        }
        case 'PAUSE': {
          return { ...currentData, state: 'paused' };
        }
        case 'ADD_LAP': {
          return {
            ...currentData,
            laps: [...currentData.laps, { dataPoints: [] as DataPoint[] }],
          };
        }
        case 'ADD_DATA': {
          const laps = currentData.laps;
          const { dataPoint } = action;

          if (currentData.state !== 'running')
            return {
              ...currentData,
              graphData: [...currentData.graphData, dataPoint],
            };

          return {
            ...currentData,
            graphData: [...currentData.graphData, dataPoint],
            laps: [
              ...laps.filter((_, i) => i !== laps.length - 1),
              {
                dataPoints: [...laps[laps.length - 1].dataPoints, dataPoint],
              },
            ],
          };
        }
      }
    },
    {
      laps: [],
      graphData: [],
      timeElapsed: 0,
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
          dispatch({ type: 'ADD_DATA', dataPoint });
          sendData(dataPoint);
        }
      }
    };
    clockWorker.onerror = (e) => console.log('message recevied:', e);
  }, [clockWorker, power, heartRate, sendData]);

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
    // setIsRunning(true);
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
    console.warn('stop');
    logEvent('workout paused');
    dispatch({ type: 'PAUSE' });
    if (smartTrainerIsConnected) {
      setResistance(0);
    }

    // setIsRunning(false);
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
        hasValidData,
        timeElapsed: data.timeElapsed,
        startingTime: data.startingTime,
        start,
        stop,
        isRunning: data.state === 'running',
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
