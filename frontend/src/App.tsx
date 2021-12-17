import { Center, Stack, Box } from '@chakra-ui/layout';
import { ChakraProvider, Button } from '@chakra-ui/react';
import * as React from 'react';
import { useGlobalClock } from './hooks/useGlobalClock';
import theme from './theme';
import { Lap } from './types';
import * as utils from './utils';
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
    isConnected: smartTrainerIsConnected,
    setResistance: setSmartTrainerResistance,
  } = useSmartTrainer();

  const { heartRate } = useHeartRateMonitor();
  const {
    activeWorkout,
    increaseElapsedTime: increaseActiveWorkoutElapsedTime,
    start: startActiveWorkout,
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
    if (running) {
      setData((laps: Lap[]) => {
        const newPoint = {
          ...heartRateToInclude,
          ...powerToInclude,
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
  }, [heartRate, power, running, setData, sendData]);
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

  const anyValidDataPoints = data.some((lap) =>
    lap.dataPoints.some((dataPoint) => dataPoint.heartRate || dataPoint.power)
  );

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
          <Center>
            <Stack width={['70%', '50%']}>
              <Button onClick={() => (running ? stop() : start())}>
                {running ? 'Stop' : 'Start'}
              </Button>
              <Button onClick={() => setSmartTrainerResistance(0)}>0 w</Button>
              <Button onClick={() => setSmartTrainerResistance(50)}>
                50 w
              </Button>
              <Button onClick={() => setSmartTrainerResistance(100)}>
                100 w
              </Button>
              <Button onClick={() => setSmartTrainerResistance(150)}>
                150 w
              </Button>
              <Button onClick={() => setSmartTrainerResistance(200)}>
                200 w
              </Button>
              <Button onClick={() => setSmartTrainerResistance(250)}>
                250 w
              </Button>
              <Button onClick={() => setSmartTrainerResistance(300)}>
                300 w
              </Button>

              {anyValidDataPoints ? (
                <Button onClick={() => utils.toTCX(data)}>Download TCX</Button>
              ) : null}
            </Stack>
          </Center>
          <Box height="5vh" />
        </Stack>
      </Center>
      <TopBar timeElapsed={timeElapsed} />
      <ActionBar />
      <BottomBar />
    </ChakraProvider>
  );
};
