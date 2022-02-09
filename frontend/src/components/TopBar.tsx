import { Center, Grid, Stack, Text } from '@chakra-ui/layout';
import { hrColor, powerColor } from '../colors';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import { useColorModeValue } from '@chakra-ui/color-mode';
import theme from '../theme';
import { useData } from '../context/DataContext';
import {
  getRemainingTime,
  getTargetPower,
  useActiveWorkout,
} from '../context/ActiveWorkoutContext';
import { secondsToHoursMinutesAndSecondsString } from '../utils/time';

export const TopBar = () => {
  const { power, cadence } = useSmartTrainer();
  const { heartRate } = useHeartRateMonitor();
  const { activeWorkout, activeFtp } = useActiveWorkout();
  const { timeElapsed, distance } = useData();
  const remainingTime = getRemainingTime(activeWorkout);
  const targetPower = getTargetPower(activeWorkout, activeFtp);

  const secondsElapsed = Math.floor(timeElapsed / 1000);

  const mainFontSize = ['xl', '3xl', '7xl'];
  const unitFontSize = ['l', '2xl', '4xl'];
  const secondaryFontSize = ['m', 'xl', '2xl'];
  const bgColor = useColorModeValue(theme.colors.white, theme.colors.gray[800]);
  const textShadow = `0px 0px 1vh ${bgColor}`;

  const flooredDistance = Math.floor(distance / 100) / 10;

  return (
    <Center
      width="100%"
      position="fixed"
      top="0"
      lineHeight="1"
      pt="2"
      textShadow={textShadow}
      fontWeight="bold"
      textAlign="center"
      pointerEvents="none"
    >
      <Stack width={['70%', '80%', '100%']}>
        <Center width="100%">
          <Grid width="90%" templateColumns="repeat(3, 1fr)">
            <Stack>
              <Center color={hrColor}>
                <Text fontSize={mainFontSize}>
                  {heartRate !== null ? heartRate : '0'}
                </Text>
                <Text fontSize={unitFontSize}>bpm</Text>
              </Center>
            </Stack>
            <Stack spacing="0">
              <Text fontSize={secondaryFontSize}>
                {flooredDistance.toFixed(1)} km
              </Text>
              {remainingTime !== null ? (
                <>
                  <Text fontSize={secondaryFontSize}>
                    {secondsToHoursMinutesAndSecondsString(secondsElapsed)}
                  </Text>
                  <Text fontSize={mainFontSize}>
                    {secondsToHoursMinutesAndSecondsString(remainingTime)}
                  </Text>
                </>
              ) : (
                <Text fontSize={mainFontSize}>
                  {secondsToHoursMinutesAndSecondsString(secondsElapsed)}
                </Text>
              )}
            </Stack>
            <Stack spacing="0" color={powerColor}>
              {targetPower !== null ? (
                <Text fontSize={secondaryFontSize}>@{targetPower}w</Text>
              ) : null}

              <Center>
                <Text fontSize={mainFontSize}>{power || '0'}</Text>
                <Text fontSize={unitFontSize}>w</Text>
              </Center>
              <Text fontSize={secondaryFontSize}>{cadence || '0'} rpm</Text>
            </Stack>
          </Grid>
        </Center>
      </Stack>
    </Center>
  );
};
