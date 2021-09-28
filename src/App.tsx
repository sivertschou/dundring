import { Center, Stack, Text } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { useHeartRate } from "./hooks/useHeartRate";
import theme from "./theme";

interface DataPoint {
  heartRate?: number;
  timeStamp: Date;
}

export const App = () => {
  const { requestHRPermission, heartRate, isConnected, disconnect } =
    useHeartRate();

  const [data, setData] = React.useState([] as DataPoint[]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        console.log("heartRate:", heartRate);
        setData((data) => [
          ...data,
          {
            heartRate: heartRate ? heartRate : undefined,
            timeStamp: new Date(),
          },
        ]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [heartRate, isConnected]);

  return (
    <ChakraProvider theme={theme}>
      <Center>
        <Stack>
          <Button
            onClick={() => (isConnected ? disconnect() : requestHRPermission())}
          >
            {isConnected ? "Disconnect" : "Connect"}{" "}
          </Button>
          {isConnected ? <Text>HR: {heartRate}</Text> : null}
          <Stack direction="column-reverse">
            {data
              .filter((d) => d.heartRate)
              .map((d, i) => (
                <Text key={i}>
                  {d.timeStamp.toUTCString()} HR: {d.heartRate}
                </Text>
              ))}
          </Stack>
        </Stack>
      </Center>
    </ChakraProvider>
  );
};
