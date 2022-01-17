import * as React from 'react';
import { Center, Grid, Stack, Text } from '@chakra-ui/layout';
import { hrColor, powerColor } from '../colors';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import { useColorModeValue } from '@chakra-ui/color-mode';
import theme from '../theme';
import { getRemainingTime, useActiveWorkout } from '../context/WorkoutContext';
import {
  formatHoursMinutesAndSecondsAsString,
  secondsToHoursMinutesAndSeconds,
} from '../utils';

interface Props {
  timeElapsed: number;
}

export const TopBar = ({ timeElapsed }: Props) => {
  const { power, cadence } = useSmartTrainer();
  const { heartRate } = useHeartRateMonitor();
  const { activeWorkout } = useActiveWorkout();

  const remainingTime = getRemainingTime(activeWorkout);

  const secondsElapsed = Math.floor(timeElapsed / 1000);

  const mainFontSize = ['xl', '3xl', '7xl'];
  const unitFontSize = ['l', '2xl', '4xl'];
  const secondaryFontSize = ['m', 'xl', '2xl'];
  const bgColor = useColorModeValue(theme.colors.white, theme.colors.gray[800]);
  const textShadow = `0px 0px 1vh ${bgColor}`;
  return (
    <Center width="100%" position="fixed" top="0">
      <Stack width={['70%', '80%', '100%']}>
        <Center width="100%">
          <Grid width="90%" templateColumns="repeat(3, 1fr)">
            <Stack>
              <Center color={hrColor} textShadow={textShadow} fontWeight="bold">
                <Text fontSize={mainFontSize}>{heartRate}</Text>
                <Text fontSize={unitFontSize}>bpm</Text>
              </Center>
            </Stack>
            <Stack>
              <Center
                textShadow={textShadow}
                textAlign="center"
                fontWeight="bold"
              >
                {remainingTime !== null ? (
                  <Stack spacing="0">
                    <Text fontSize={secondaryFontSize}>
                      {formatHoursMinutesAndSecondsAsString(
                        secondsToHoursMinutesAndSeconds(secondsElapsed)
                      )}
                    </Text>
                    <Text fontSize={mainFontSize} lineHeight="1">
                      {formatHoursMinutesAndSecondsAsString(
                        secondsToHoursMinutesAndSeconds(remainingTime)
                      )}
                    </Text>
                  </Stack>
                ) : (
                  <Text fontSize={mainFontSize}>
                    {formatHoursMinutesAndSecondsAsString(
                      secondsToHoursMinutesAndSeconds(secondsElapsed)
                    )}
                  </Text>
                )}
              </Center>
            </Stack>
            <Stack spacing="0">
              <Center
                color={powerColor}
                textShadow={textShadow}
                fontWeight="bold"
              >
                <Text fontSize={mainFontSize}>{power}</Text>
                <Text fontSize={unitFontSize}>w</Text>
              </Center>
              <Center
                color={powerColor}
                textShadow={textShadow}
                fontWeight="bold"
              >
                <Text fontSize={secondaryFontSize}>{cadence} spm</Text>
              </Center>
            </Stack>
          </Grid>
        </Center>
      </Stack>
    </Center>
  );
};
