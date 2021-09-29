import { Center, Stack, Text, Flex } from "@chakra-ui/layout";
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

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (hrIsConnected || smartTrainerIsConnected) {
        setData((data) => [
          ...data,
          {
            heartRate: heartRate,
            power,
            timeStamp: new Date(),
          },
        ]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [heartRate, hrIsConnected]);

  return (
    <ChakraProvider theme={theme}>
      <Center>
        <Stack width="80%">
          <Center>
            <Graphs data={data} />
          </Center>
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
          <Text>{hrIsConnected ? `HR: ${heartRate}` : "No HR connected."}</Text>
          <Text>
            {smartTrainerIsConnected
              ? `Power: ${power}`
              : "No Smart Trainer connected."}
          </Text>

          {data.length > 0 ? (
            <Button onClick={() => utils.toTCX(data)}>Convert to TCX</Button>
          ) : null}
        </Stack>
      </Center>
    </ChakraProvider>
  );
};
