import * as React from "react";
import { Center, Grid, Link, Stack, Text } from "@chakra-ui/layout"
import { hrColor, powerColor } from "../colors";
import { useSmartTrainer } from "../context/SmartTrainerContext";
import { useHeartRateMonitor } from "../context/HeartRateContext";
import { useColorModeValue } from "@chakra-ui/color-mode";
import theme from "../theme";
import { useAvailability } from "../hooks/useAvailability";

interface Props {
  timeElapsed: number;
}
export const TopBar = ({ timeElapsed }: Props) => {
  const {
    power,
  } = useSmartTrainer();

  const { available: bluetoothIsAvailable } = useAvailability();
  const { heartRate } = useHeartRateMonitor();

  const secondsElapsed = Math.floor(timeElapsed / 1000);
  const hours = Math.floor((secondsElapsed / 60 / 60) % 24);
  const minutes = Math.floor((secondsElapsed / 60) % 60);
  const seconds = Math.floor(secondsElapsed % 60);

  const mainFontSize = ["3xl", "5xl", "7xl"]
  const unitFontSize = ["xl", "2xl", "4xl"]
  const bgColor = useColorModeValue(theme.colors.white, theme.colors.gray[800]);
  const textShadow = `0px 0px 1vh ${bgColor}`
  return (
    <Center width="100%" position="fixed" top="0">
      <Stack width="100%">
          {!bluetoothIsAvailable ? (
            <Center p="2" backgroundColor="red">
              <Text fontSize="xl">
                Bluetooth is not available in this browser yet. Check{" "}
                <Link textDecor="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth#browser_compatibility">
                  the docs for browsers supporting Bluetooth
                </Link>
                .
              </Text>
            </Center>
          ) : null}
      <Grid width="90%" templateColumns="repeat(3, 1fr)">
        <Center color={hrColor} textShadow={textShadow}>
          <Text fontSize={mainFontSize} fontWeight="bold">
            {heartRate}
          </Text>
          <Text fontSize={unitFontSize} fontWeight="bold">
            bpm
          </Text>
        </Center>
        <Center textShadow={textShadow}>
          <Text fontSize={mainFontSize} fontWeight="bold">
            {hours ? hours + ":" : null}
            {minutes < 10 ? "0" + minutes : minutes}
            {":"}
            {seconds < 10 ? "0" + seconds : seconds}
          </Text>
        </Center>
        <Center color={powerColor} textShadow={textShadow} >
          <Text fontSize={mainFontSize} fontWeight="bold">
            {power}
          </Text>
          <Text fontSize={unitFontSize} fontWeight="bold">
            w
          </Text>
        </Center>
      </Grid>
      </Stack>
    </Center>
  );
}
