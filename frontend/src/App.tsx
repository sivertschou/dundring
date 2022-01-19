import { Center, Stack } from '@chakra-ui/layout';
import { ChakraProvider } from '@chakra-ui/react';
import * as React from 'react';
import { useGlobalClock } from './hooks/useGlobalClock';
import theme from './theme';
import { Lap } from './types';
import { WorkoutDisplay } from './components/WorkoutDisplay';
import { ActionBar } from './components/ActionBar';
import { useHeartRateMonitor } from './context/HeartRateContext';
import { useSmartTrainer } from './context/SmartTrainerContext';
import { useActiveWorkout } from './context/WorkoutContext';
import { GraphContainer } from './components/Graph/GraphContainer';
import { useWebsocket } from './context/WebsocketContext';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { useLogs } from './context/LogContext';
interface Props {
  clockWorker: Worker;
}
export const App = ({ clockWorker }: Props) => {
  const {
    power,
    cadence,
    isConnected: smartTrainerIsConnected,
    setResistance: setSmartTrainerResistance,
  } = useSmartTrainer();

  const { heartRate } = useHeartRateMonitor();
  const {
    activeWorkout,
    increaseElapsedTime: increaseActiveWorkoutElapsedTime,
    start: startActiveWorkout,
    syncResistance,
  } = useActiveWorkout();

  const [data, setData] = React.useState<Lap[]>([]);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [startingTime, setStartingTime] = React.useState<Date | null>(null);

  const { sendData } = useWebsocket();
  const {
    running,
    start: startGlobalClock,
    stop: stopGlobalClock,
  } = useGlobalClock((timeSinceLast) => {
    setTimeElapsed((prev) => prev + timeSinceLast);
    if (activeWorkout && !activeWorkout.isDone) {
      increaseActiveWorkoutElapsedTime(timeSinceLast, () => {
        return setData((data) => [...data, { dataPoints: [] }]);
      });
    }
  });
  const { logEvent } = useLogs();

  const send = React.useCallback(() => {
    const heartRateToInclude = heartRate ? { heartRate } : {};
    const powerToInclude = power ? { power } : {};
    const cadenceToInclude = cadence ? { cadence } : {};
    if (running) {
      setData((laps: Lap[]) => {
        const newPoint = {
          ...heartRateToInclude,
          ...powerToInclude,
          ...cadenceToInclude,
          timeStamp: new Date(),
        };

        return [
          ...laps.filter((_, i) => i !== laps.length - 1),
          {
            dataPoints: [...laps[laps.length - 1].dataPoints, newPoint],
          },
        ];
      });
    }

    sendData({ ...heartRateToInclude, ...powerToInclude });
  }, [heartRate, power, cadence, running, setData, sendData]);
  React.useEffect(() => {
    if (clockWorker === null) return;

    clockWorker.onmessage = (_e) => {
      send();
    };
    clockWorker.onerror = (e) => console.log('message recevied:', e);
  }, [clockWorker, send]);

  const start = () => {
    if (!startingTime) {
      setStartingTime(new Date());
      setData([{ dataPoints: [] }]);
      logEvent('workout started');
    } else {
      logEvent('workout resumed');
      syncResistance();
    }
    startGlobalClock();
    startActiveWorkout();
    clockWorker.postMessage('startTimer');
  };

  const stop = () => {
    logEvent('workout paused');
    stopGlobalClock();
    if (smartTrainerIsConnected) {
      setSmartTrainerResistance(0);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Center>
        <Stack width="100%" pt={['30', '50', '100']}>
          <Center width="100%">
            <Center width="90%">
              {activeWorkout ? <WorkoutDisplay /> : null}
              <GraphContainer data={data.flatMap((x) => x.dataPoints)} />
            </Center>
          </Center>
        </Stack>
      </Center>
      <TopBar timeElapsed={timeElapsed} />
      <ActionBar />
      <BottomBar start={start} stop={stop} running={running} data={data} />
    </ChakraProvider>
  );
};
