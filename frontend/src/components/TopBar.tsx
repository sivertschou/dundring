import * as React from 'react';
import { Center, Grid, Stack, Text } from '@chakra-ui/layout';
import { hrColor, powerColor } from '../colors';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import { useColorModeValue } from '@chakra-ui/color-mode';
import theme from '../theme';

interface Props {
  timeElapsed: number;
}
export const TopBar = ({ timeElapsed }: Props) => {
  const { power } = useSmartTrainer();

  const { heartRate } = useHeartRateMonitor();

  const secondsElapsed = Math.floor(timeElapsed / 1000);
  const hours = Math.floor((secondsElapsed / 60 / 60) % 24);
  const minutes = Math.floor((secondsElapsed / 60) % 60);
  const seconds = Math.floor(secondsElapsed % 60);

  const mainFontSize = ['xl', '3xl', '7xl'];
  const unitFontSize = ['l', '2xl', '4xl'];
  const bgColor = useColorModeValue(theme.colors.white, theme.colors.gray[800]);
  const textShadow = `0px 0px 1vh ${bgColor}`;
  return (
    <Center width="100%" position="fixed" top="0">
      <Stack width={['70%', '80%', '100%']}>
        <Center width="100%">
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
                {hours ? hours + ':' : null}
                {minutes < 10 ? '0' + minutes : minutes}
                {':'}
                {seconds < 10 ? '0' + seconds : seconds}
              </Text>
            </Center>
            <Center color={powerColor} textShadow={textShadow}>
              <Text fontSize={mainFontSize} fontWeight="bold">
                {power}
              </Text>
              <Text fontSize={unitFontSize} fontWeight="bold">
                w
              </Text>
            </Center>
          </Grid>
        </Center>
      </Stack>
    </Center>
  );
};
