import { Center, Grid, Stack, Text } from '@chakra-ui/layout';
import { hrColor, powerColor } from '../colors';
import { useSmartTrainer } from '../context/SmartTrainerContext';
import { useHeartRateMonitor } from '../context/HeartRateContext';
import { useColorModeValue } from '@chakra-ui/color-mode';
import theme from '../theme';
import { useData } from '../context/DataContext';
import {
  getRemainingTime,
  useActiveWorkout,
} from '../context/ActiveWorkoutContext';
import { secondsToHoursMinutesAndSecondsString } from '@dundring/utils';
import { Lap } from '../types';
import React from 'react';
import { useReadOnlyOptions } from '../context/OptionsContext';

const mainFontSize = ['xl', '3xl', '7xl'];
const unitFontSize = ['l', '2xl', '4xl'];
const secondaryFontSize = ['m', 'xl', '2xl'];

export const TopBar = () => {
  const { cadence, currentResistance } = useSmartTrainer();
  const { heartRate } = useHeartRateMonitor();
  const { activeWorkout } = useActiveWorkout();
  const {
    data: laps,
    timeElapsed,
    distance,
    speed,
    smoothedPower,
    maxHeartRate,
  } = useData();

  const options = useReadOnlyOptions();

  const remainingTime = getRemainingTime(activeWorkout);

  const secondsElapsed = Math.floor(timeElapsed / 1000);

  const bgColor = useColorModeValue(theme.colors.white, theme.colors.gray[800]);
  const textShadow = `0px 0px 1vh ${bgColor}`;

  const flooredDistance = Math.floor(distance / 100) / 10;

  const isFreeMode = !currentResistance;

  const currentLap = laps.at(-1) || null;

  const hasRemainingTime = remainingTime !== null;

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
              {maxHeartRate && (
                <Text color={hrColor} fontSize={secondaryFontSize}>
                  Max: {maxHeartRate} bpm
                </Text>
              )}
            </Stack>
            <Stack spacing="0">
              <Text fontSize={secondaryFontSize}>
                {((3600 * speed) / 1000).toFixed(1)} km/h
              </Text>
              <Text fontSize={secondaryFontSize}>
                {flooredDistance.toFixed(1)} km
              </Text>
              ? (
              <Text
                visibility={
                  options.showTotalDurationTimer ? 'visible' : 'hidden'
                }
                fontSize={hasRemainingTime ? secondaryFontSize : mainFontSize}
              >
                {secondsToHoursMinutesAndSecondsString(secondsElapsed)}
              </Text>
              {hasRemainingTime ? (
                <Text
                  visibility={options.showIntervalTimer ? 'visible' : 'hidden'}
                  fontSize={mainFontSize}
                >
                  {secondsToHoursMinutesAndSecondsString(remainingTime)}
                </Text>
              ) : null}
              )
            </Stack>
            <Stack spacing="0" color={powerColor}>
              <Text fontSize={secondaryFontSize}>
                {!isFreeMode ? `@${currentResistance}w` : 'Free mode'}
              </Text>
              <Center>
                <Text fontSize={mainFontSize}>{smoothedPower || '0'}</Text>
                <Text fontSize={unitFontSize}>w</Text>
              </Center>
              {isFreeMode && <AvgWattText currentLap={currentLap} />}

              <Text fontSize={secondaryFontSize}>{cadence || '0'} rpm</Text>
            </Stack>
          </Grid>
        </Center>
      </Stack>
    </Center>
  );
};

const AvgWattText = (props: { currentLap: Lap | null }) => {
  const { currentLap } = props;
  if (!currentLap?.normalizedDuration) {
    return null;
  }
  return (
    <Text fontSize={secondaryFontSize}>
      Lap avg:
      {(currentLap.sumWatt / currentLap.normalizedDuration).toFixed(0)}W
    </Text>
  );
};
