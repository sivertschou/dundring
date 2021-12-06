import { Center, Stack } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { useGlobalClock } from "./hooks/useGlobalClock";
import theme from "./theme";
import { Lap } from "./types";
import * as utils from "./utils";
import { WorkoutDisplay } from "./components/WorkoutDisplay";
import { ActionBar } from "./components/ActionBar";
import { useHeartRateMonitor } from "./context/HeartRateContext";
import { useSmartTrainer } from "./context/SmartTrainerContext";
import { useActiveWorkout } from "./context/WorkoutContext";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { useWebsocket } from "./context/WebsocketContext";
import { TopBar } from "./components/TopBar";
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
        return setData(data => [...data, { dataPoints: [] }])
      });
    }
  });

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
    clockWorker.onerror = (e) => console.log("message recevied:", e);
  }, [clockWorker, send]);

  const start = () => {
    if (!startingTime) {
      setStartingTime(new Date());
      setData([{ dataPoints: [] }])
    }
    startGlobalClock();
    startActiveWorkout();
    clockWorker.postMessage("startTimer");
  };

  const stop = () => {
    stopGlobalClock();
    if (smartTrainerIsConnected) {
      setSmartTrainerResistance(0);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Center>
        <Stack width="100%" pt={["0", "50", "100"]}>
          <Center width="100%">
            <Center width={["60%", "70%", "80%", "90%"]} >
              {activeWorkout ? <WorkoutDisplay /> : null}
              <GraphContainer data={data.flatMap((x) => x.dataPoints)} />
            </Center>
          </Center>
          <Center>
            <Stack width={["100%", "80%"]}>
              <Button onClick={() => (running ? stop() : start())}>
                {running ? "Stop" : "Start"}
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

              {data.length > 0 ? (
                <Button onClick={() => utils.toTCX(data)}>Download TCX</Button>
              ) : null}
            </Stack>
          </Center>
        </Stack>
      </Center>
      <TopBar timeElapsed={timeElapsed} />
      <ActionBar />
    </ChakraProvider>
  );
};
