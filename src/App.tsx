import { Center, Stack, Text } from "@chakra-ui/layout";
import { ChakraProvider, Button } from "@chakra-ui/react";
import * as React from "react";
import { useHeartRate } from "./hooks/useHeartRate";
import theme from "./theme";

export const App = () => {
  const { requestHRPermission, heartRate, isConnected, disconnect } =
    useHeartRate();
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
        </Stack>
      </Center>
    </ChakraProvider>
  );
};
