import { Center, Stack } from '@chakra-ui/layout';
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
import { useLocation, useParams } from 'react-router-dom';
import { useGroupSessionModal } from '../context/ModalContext';
import { Modals } from '../components/Modals/Modals';
import { BottomBar } from '../components/BottomBar';

interface Props {
  clockWorker: Worker;
}
export const MainPage = ({ clockWorker }: Props) => {
  const { sendData, connect } = useWebsocket();
  const location = useLocation();
  const params = useParams();
  const { onOpen: onOpenGroupSessionModal, onClose: onCloseGroupSessionModal } =
    useGroupSessionModal();

  React.useEffect(() => {
    const path = location.pathname.split('/')[1];
    switch (path) {
      case 'group':
        onOpenGroupSessionModal();
        connect();
        return;
      default:
        onCloseGroupSessionModal();
    }
  }, [
    location,
    params,
    connect,
    onOpenGroupSessionModal,
    onCloseGroupSessionModal,
  ]);

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

  const {
    running,
    start: startGlobalClock,
    stop: stopGlobalClock,
  } = useGlobalClock((timeSinceLast) => {
    setTimeElapsed((prev) => prev + timeSinceLast);
    if (activeWorkout && activeWorkout.status === 'active') {
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
    startActiveWorkout();
    startGlobalClock();
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
    <>
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
      <Modals />
      <BottomBar start={start} stop={stop} running={running} data={data} />
    </>
  );
};
