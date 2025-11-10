import * as React from 'react';
import { DataPoint } from '../types';
import { useActiveWorkout } from './ActiveWorkoutContext';
import { useHeartRateMonitor } from './HeartRateContext';
import { useLogs } from './LogContext';
import { useSmartTrainer } from './SmartTrainerContext';
import { useWebsocket } from './WebsocketContext';
import * as db from '../db';
import { WorkoutDataPoint } from '../db';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { useLiveRef } from '../hooks/useLiveRef';

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

  // Timestamp-based time tracking instead of delta accumulation
  const startTimestampRef = React.useRef<number | null>(null);
  const totalElapsedBeforePauseRef = React.useRef<number>(0);
  const lastDbUpdateRef = React.useRef<number>(0);

  const accumulatedTimeRef = useLiveRef(0);
  const powerRef = useLiveRef(power);
  const heartRateRef = useLiveRef(heartRate);
  const cadenceRef = useLiveRef(cadence);

  const dataTick = React.useCallback(
    async (delta: number) => {
      try {
        // Flush elapsed time to DB using timestamp-based calculation
        if (startTimestampRef.current !== null) {
          const now = Date.now();
          const currentElapsedTotal =
            totalElapsedBeforePauseRef.current +
            (now - startTimestampRef.current);
          const deltaToFlush = currentElapsedTotal - lastDbUpdateRef.current;

          if (deltaToFlush > 0) {
            await db.addElapsedTime(deltaToFlush);
            lastDbUpdateRef.current = currentElapsedTotal;
          }
        }

        const currentHeartRate = heartRateRef.current;
        const currentPower = powerRef.current;
        const currentCadence = cadenceRef.current;

        const heartRateToInclude = currentHeartRate
          ? { heartRate: currentHeartRate }
          : {};
        const powerToInclude = currentPower ? { power: currentPower } : {};
        const cadenceToInclude = currentCadence
          ? { cadence: currentCadence }
          : {};
        const dataPoint = {
          timestamp: new Date(),
          ...heartRateToInclude,
          ...powerToInclude,
          ...cadenceToInclude,
        };

        if (dataPoint.cadence || dataPoint.power || dataPoint.heartRate) {
          const data = {
            heartRate: currentHeartRate,
            power: currentPower,
            cadence: currentCadence,
          };
          await db.addDatapoint(delta, data, isRunning);
          sendData(dataPoint);
        }
      } catch (error) {
        console.error('Failed to process dataTick:', error);
      }
    },
    [isRunning, sendData]
  );

  const clockTick = React.useCallback(() => {
    // Calculate elapsed time from timestamp instead of accumulating deltas
    if (startTimestampRef.current === null) return;

    const now = Date.now();
    const currentElapsedTotal =
      totalElapsedBeforePauseRef.current + (now - startTimestampRef.current);
    const deltaToAdd = currentElapsedTotal - accumulatedTimeRef.current;

    if (deltaToAdd > 0) {
      accumulatedTimeRef.current = currentElapsedTotal;
      increaseActiveWorkoutElapsedTime(deltaToAdd);
    }
  }, [increaseActiveWorkoutElapsedTime]);

  React.useEffect(() => {
    if (clockWorker === null) return;

    clockWorker.onmessage = async ({
      data,
    }: MessageEvent<{ type: string; delta: number }>) => {
      if (!data) return;
      switch (data.type) {
        case 'clockTick': {
          clockTick(); // No longer using delta from worker
          break;
        }
        case 'dataTick': {
          await dataTick(data.delta);
        }
      }
    };
    clockWorker.onerror = (e) => console.error('Clock worker error:', e);

    return () => {
      clockWorker.onerror = null;
      clockWorker.onmessage = null;
    };
  }, [clockTick, dataTick]);

  const start = React.useCallback(async () => {
    if (trackedData.length > 0) {
      logEvent('workout started');
    } else {
      logEvent('workout resumed');
      syncResistance();
    }

    // Initialize timestamp-based tracking
    startTimestampRef.current = Date.now();
    // If resuming, keep the accumulated time; if starting fresh, it should be 0
    totalElapsedBeforePauseRef.current = accumulatedTimeRef.current;

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

    // Calculate final elapsed time before pausing
    if (startTimestampRef.current !== null) {
      const now = Date.now();
      const currentElapsedTotal =
        totalElapsedBeforePauseRef.current + (now - startTimestampRef.current);
      const deltaToFlush = currentElapsedTotal - lastDbUpdateRef.current;

      if (deltaToFlush > 0) {
        try {
          await db.addElapsedTime(deltaToFlush);
          lastDbUpdateRef.current = currentElapsedTotal;
          accumulatedTimeRef.current = currentElapsedTotal;
        } catch (error) {
          console.error('Failed to flush elapsed time on stop:', error);
        }
      }

      // Reset timestamp for next resume
      startTimestampRef.current = null;
    }
  }, [clockWorker, smartTrainerIsConnected, setResistance, logEvent]);

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
        addLap: async () => {
          await db.addLap();
        },
        state,
        isRunning,
        smoothedPower: getSmoothedPower(graphData),
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
