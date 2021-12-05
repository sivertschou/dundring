import { Center, Stack, Text, Grid, Link } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { useAvailability } from "./hooks/useAvailability";
import { useGlobalClock } from "./hooks/useGlobalClock";
import theme from "./theme";
import { Lap } from "./types";
import * as utils from "./utils";
import { WorkoutDisplay } from "./components/WorkoutDisplay";
import { ActionBar } from "./components/ActionBar";
import { useHeartRateMonitor } from "./context/HeartRateContext";
import { hrColor, powerColor } from "./colors";
import { useSmartTrainer } from "./context/SmartTrainerContext";
import { useActiveWorkout } from "./context/WorkoutContext";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { useWebsocket } from "./context/WebsocketContext";
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
  const { available: bluetoothIsAvailable } = useAvailability();
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
      increaseActiveWorkoutElapsedTime(timeSinceLast, () => { console.log("addLap"); return setData(data => [...data, {dataPoints: []}])});
    }
  });

  const send = React.useCallback(() => {
    const heartRateToInclude = heartRate ? { heartRate } : {};
    const powerToInclude = power ? { power } : {};
    if (running) {
    console.log("laps:", data)
      setData((laps: Lap[]) => {
        const newPoint = {
          ...heartRateToInclude,
          ...powerToInclude,
          timeStamp: new Date(),
        };

        // if (laps.length === 0) {
        //   return [{ dataPoints: [newPoint] }];
        // }

        // if (laps[activeWorkout.activePart] === undefined) {
        //   return [...laps, { dataPoints: [newPoint] }];
        // }
        return [
          ...laps.filter((_, i) => i !== laps.length - 1),
          {
            dataPoints: [...laps[laps.length - 1].dataPoints, newPoint],
          },
        ];
      });
    }

    sendData({ ...heartRateToInclude, ...powerToInclude });
  }, [heartRate, power, running, setData, data, sendData ]);
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
      setData([{dataPoints: []}])
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
  const secondsElapsed = Math.floor(timeElapsed / 1000);
  const hours = Math.floor((secondsElapsed / 60 / 60) % 24);
  const minutes = Math.floor((secondsElapsed / 60) % 60);
  const seconds = Math.floor(secondsElapsed % 60);

  return (
    <ChakraProvider theme={theme}>
      <ActionBar />
      <Center>
        <Stack width="80%">
          {!bluetoothIsAvailable ? (
            <Center p="5" backgroundColor="red">
              <Text fontSize="2xl">
                Bluetooth is not available in this browser yet. Check{" "}
                <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth#browser_compatibility">
                  the docs for browsers supporting Bluetooth
                </Link>
                .
              </Text>
            </Center>
          ) : null}
          <Grid templateColumns="repeat(3, 1fr)">
            <Center p="10" color={hrColor}>
              <Text fontSize="7xl" fontWeight="bold">
                {heartRate}
              </Text>
              <Text fontSize="4xl" fontWeight="bold">
                bpm
              </Text>
            </Center>
            <Center p="10">
              <Text fontSize="7xl" fontWeight="bold">
                {hours ? hours + ":" : null}
                {minutes < 10 ? "0" + minutes : minutes}
                {":"}
                {seconds < 10 ? "0" + seconds : seconds}
              </Text>
            </Center>
            <Center p="10" color={powerColor}>
              <Text fontSize="7xl" fontWeight="bold">
                {power}
              </Text>
              <Text fontSize="4xl" fontWeight="bold">
                w
              </Text>
            </Center>
          </Grid>
          <Center>
            {activeWorkout ? <WorkoutDisplay /> : null}
            <GraphContainer data={data.flatMap((x) => x.dataPoints)} />
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
    </ChakraProvider>
  );
};
