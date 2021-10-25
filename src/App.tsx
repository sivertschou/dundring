import { Center, Stack, Text, Grid, Link } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { WorkoutContext } from "./context/WorkoutContext";
import { Graphs } from "./Graphs";
import { useAvailability } from "./hooks/useAvailability";
import { useGlobalClock } from "./hooks/useGlobalClock";
import { useHeartRateMonitor } from "./hooks/useHeartRateMonitor";
import { useSmartTrainer } from "./hooks/useSmartTrainer";
import { useWorkout } from "./hooks/useWorkout";
import theme from "./theme";
import { DataPoint } from "./types";
import * as utils from "./utils";
import { WorkoutDisplay } from "./WorkoutDisplay";
import { WorkoutEditor } from "./WorkoutEditor";
export const App = () => {
  const {
    requestHRPermission,
    heartRate,
    isConnected: hrIsConnected,
    disconnect: disconnectHR,
  } = useHeartRateMonitor();

  const {
    requestSmartTrainerPermission,
    power,
    isConnected: smartTrainerIsConnected,
    disconnect: disconnectSmartTrainer,
    setResistance: setSmartTrainerResistance,
  } = useSmartTrainer();

  const { available: bluetoothIsAvailable } = useAvailability();

  const [data, setData] = React.useState([] as DataPoint[]);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [startingTime, setStartingTime] = React.useState(null as Date | null);
  const {
    running,
    addCallback,
    removeCallback,
    start: startGlobalClock,
    stop: stopGlobalClock,
  } = useGlobalClock();

  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (running) {
  //       const heartRateToInclude = heartRate ? { heartRate } : {};
  //       const powerToInclude = power ? { power } : {};
  //       setData((data) => [
  //         ...data,
  //         {
  //           ...heartRateToInclude,
  //           ...powerToInclude,
  //           timeStamp: new Date(),
  //         },
  //       ]);
  //     }
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, [power, startingTime, heartRate, hrIsConnected]);

  const workout = useWorkout();
  const start = () => {
    startGlobalClock();
    addCallback({
      name: "Basic",
      callback: (timeSinceLast) =>
        setTimeElapsed((prev) => prev + timeSinceLast),
    });
    if (!startingTime) {
      setStartingTime(new Date());
    }
  };

  const stop = () => {
    removeCallback("Basic");
    stopGlobalClock();
  };
  const secondsElapsed = Math.round(timeElapsed / 1000);
  const hours = Math.floor((secondsElapsed / 60 / 60) % 24);
  const minutes = Math.floor((secondsElapsed / 60) % 60);
  const seconds = Math.floor(secondsElapsed % 60);

  return (
    <ChakraProvider theme={theme}>
      <WorkoutContext.Provider
        value={{
          workout: workout.workout,
          activePart: workout.activePart,
          partElapsedTime: workout.partElapsedTime,
        }}
      >
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
              <Center p="10" color="#ff4d4a">
                <Text fontSize="7xl" fontWeight="bold">
                  {heartRate}
                </Text>
                <Text fontSize="4xl" fontWeight="bold">
                  bpm
                </Text>
              </Center>
              <Center p="10" color="white">
                <Text fontSize="7xl" fontWeight="bold">
                  {hours ? hours + ":" : null}
                  {minutes < 10 ? "0" + minutes : minutes}
                  {":"}
                  {seconds < 10 ? "0" + seconds : seconds}
                </Text>
              </Center>
              <Center p="10" color="#ae4aff">
                <Text fontSize="7xl" fontWeight="bold">
                  {power}
                </Text>
                <Text fontSize="4xl" fontWeight="bold">
                  w
                </Text>
              </Center>
            </Grid>
            <Center>
              <WorkoutDisplay />
              <Graphs data={data} />
            </Center>
            <Center>
              <Stack width={["100%", "80%"]}>
                <WorkoutEditor setWorkout={workout.setWorkout} />
                <Button onClick={() => (running ? stop() : start())}>
                  {running ? "Stop" : "Start"}
                </Button>
                {/* <Button onClick={() => setSmartTrainerResistance(0)}>
                  0 w
                </Button>
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
                </Button> */}
                <Button
                  disabled={!bluetoothIsAvailable}
                  onClick={() =>
                    hrIsConnected ? disconnectHR() : requestHRPermission()
                  }
                >
                  {hrIsConnected ? "Disconnect HR" : "Connect HR"}{" "}
                </Button>
                <Button
                  disabled={!bluetoothIsAvailable}
                  onClick={() =>
                    smartTrainerIsConnected
                      ? disconnectSmartTrainer()
                      : requestSmartTrainerPermission()
                  }
                >
                  {smartTrainerIsConnected
                    ? "Disconnect Smart Trainer"
                    : "Connect Smart Trainer"}{" "}
                </Button>

                {data.length > 0 ? (
                  <Button onClick={() => utils.toTCX(data, "Dundring")}>
                    Download TCX
                  </Button>
                ) : null}
              </Stack>
            </Center>
          </Stack>
        </Center>
      </WorkoutContext.Provider>
    </ChakraProvider>
  );
};
