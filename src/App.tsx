import { Center, Stack, Text, Grid } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { Graphs } from "./Graphs";
import { useHeartRateMonitor } from "./hooks/useHeartRateMonitor";
import { useSmartTrainer } from "./hooks/useSmartTrainer";
import theme from "./theme";
import { DataPoint } from "./types";
import * as utils from "./utils";
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
  } = useSmartTrainer();

  const [data, setData] = React.useState([] as DataPoint[]);
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const [startingTime, setStartingTime] = React.useState(null as Date | null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (started) {
        setData((data) => [
          ...data,
          {
            heartRate,
            power,
            timeStamp: new Date(),
          },
        ]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [started, power, startingTime, heartRate, hrIsConnected]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (started) {
        if (startingTime) {
          setSecondsElapsed(getSecondsSince(startingTime));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [started, startingTime]);

  const getSecondsSince = (startTime: Date) => {
    const now = new Date();
    const seconds = (now.getTime() - startTime.getTime()) / 1000;
    return seconds;
  };

  const start = () => {
    setStarted(true);
    setStartingTime(new Date());
  };

  const stop = () => {
    setStarted(false);
  };

  const hours = Math.floor((secondsElapsed / 60 / 60) % 24);
  const minutes = Math.floor((secondsElapsed / 60) % 60);
  const seconds = Math.floor(secondsElapsed % 60);

  return (
    <ChakraProvider theme={theme}>
      <Center>
        <Stack width="60%">
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
            <Graphs data={data} />
          </Center>
          <Center>
            <Stack width="25%">
              <Button onClick={() => (started ? stop() : start())}>
                {started ? "Stop" : "Start"}
              </Button>
              <Button
                onClick={() =>
                  hrIsConnected ? disconnectHR() : requestHRPermission()
                }
              >
                {hrIsConnected ? "Disconnect HR" : "Connect HR"}{" "}
              </Button>
              <Button
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
    </ChakraProvider>
  );
};
