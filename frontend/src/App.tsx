import { Center, Stack, Text, Grid, Link } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { WorkoutContext } from "./context/WorkoutContext";
import { Graphs } from "./components/Graphs";
import { useAvailability } from "./hooks/useAvailability";
import { useGlobalClock } from "./hooks/useGlobalClock";
import { useSmartTrainer } from "./hooks/useSmartTrainer";
import { useWorkout } from "./hooks/useWorkout";
import theme from "./theme";
import { DataPoint } from "./types";
import * as utils from "./utils";
import { WorkoutDisplay } from "./components/WorkoutDisplay";
import { WorkoutEditor } from "./components/WorkoutEditor";
import { ActionBar } from "./components/ActionBar";
import { useHeartRate } from "./context/HeartRateContext";

export const App = () => {
  const {
    requestSmartTrainerPermission,
    power,
    isConnected: smartTrainerIsConnected,
    disconnect: disconnectSmartTrainer,
    setResistance: setSmartTrainerResistance,
  } = useSmartTrainer();

  const {
    disconnect: disconnectHR,
    heartRate,
    isConnected: hrIsConnected,
    requestPermission: requestHRPermission,
  } = useHeartRate();

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

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        const heartRateToInclude = heartRate ? { heartRate } : {};
        const powerToInclude = power ? { power } : {};
        setData((data) => [
          ...data,
          {
            ...heartRateToInclude,
            ...powerToInclude,
            timeStamp: new Date(),
          },
        ]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [power, startingTime, heartRate, hrIsConnected]);

  const workout = useWorkout(
    smartTrainerIsConnected,
    power,
    setSmartTrainerResistance
  );
  const start = () => {
    startGlobalClock();
    addCallback({
      name: "Basic",
      callback: (timeSinceLast) => {
        setTimeElapsed((prev) => prev + timeSinceLast);
        if (workout.workout.parts.length > 0) {
          workout.increaseElapsedTime(timeSinceLast);
        }
      },
    });
    if (!startingTime) {
      setStartingTime(new Date());
    }
    const validWorkoutSelected = workout.workout.parts.length > 0;
    if (validWorkoutSelected) {
      workout.start();
    }
  };

  const stop = () => {
    removeCallback("Basic");
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
      <WorkoutContext.Provider
        value={{
          workout: workout.workout,
          activePart: workout.activePart,
          partElapsedTime: workout.partElapsedTime,
          isDone: workout.isDone,
        }}
      >
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
              <Center p="10" color="red.500">
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
              <Center p="10" color="purple.500">
                <Text fontSize="7xl" fontWeight="bold">
                  {power}
                </Text>
                <Text fontSize="4xl" fontWeight="bold">
                  w
                </Text>
              </Center>
            </Grid>
            <Center>
              {workout.workout.parts.length > 0 ? <WorkoutDisplay /> : null}
              <Graphs data={data} />
            </Center>
            <Center>
              <Stack width={["100%", "80%"]}>
                <WorkoutEditor setWorkout={workout.setWorkout} />
                <Button onClick={() => (running ? stop() : start())}>
                  {running ? "Stop" : "Start"}
                </Button>
                <Button onClick={() => setSmartTrainerResistance(0)}>
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
                </Button>
                <Button onClick={() => setSmartTrainerResistance(250)}>
                  250 w
                </Button>
                <Button onClick={() => setSmartTrainerResistance(300)}>
                  300 w
                </Button>
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
