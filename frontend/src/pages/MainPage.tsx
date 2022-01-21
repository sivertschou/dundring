import { Button } from '@chakra-ui/button';
import { Center, Stack, Box } from '@chakra-ui/layout';
import * as React from 'react';
import { GraphContainer } from '../components/Graph/GraphContainer';
import { WorkoutDisplay } from '../components/WorkoutDisplay';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import { useLogs } from '../context/LogContext';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useWebsocket } from '../context/WebsocketContext';
import { useActiveWorkout } from '../context/WorkoutContext';
import { Lap } from '../types';

import { useGlobalClock } from '../hooks/useGlobalClock';
import { ActionBar } from '../components/ActionBar';
import { TopBar } from '../components/TopBar';
import { toTCX } from '../createTcxFile';

interface Props {
  clockWorker: Worker;
}
export const MainPage = ({ clockWorker }: Props) => {
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

  const anyValidDataPoints = data.some((lap) =>
    lap.dataPoints.some((dataPoint) => dataPoint.heartRate || dataPoint.power)
  );

  return (
    <>
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
                {getStartStopButtonText({ smartTrainerIsConnected, running })}
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
                <Button onClick={() => toTCX(data)}>Download TCX</Button>
              ) : null}
            </Stack>
          </Center>
          <Box height="5vh" />
        </Stack>
      </Center>
      <TopBar timeElapsed={timeElapsed} />
      <ActionBar />
    </>
  );
};

const getStartStopButtonText = ({
  smartTrainerIsConnected,
  running,
}: {
  smartTrainerIsConnected: boolean;
  running: boolean;
}): string => {
  if (running) return 'Stop';
  if (smartTrainerIsConnected) return 'Start';
  return 'Start (without power)';
};
