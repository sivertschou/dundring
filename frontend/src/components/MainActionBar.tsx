import * as React from 'react';

import {
  Center,
  Text,
  Stack,
  Box,
  Grid,
  HStack,
  GridItem,
} from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';
import {
  ArrowDown,
  ArrowUp,
  LightningChargeFill,
  PlayFill,
  Grid3x2GapFill,
  SkipBackwardFill,
  SkipStartFill,
  PauseFill,
  SkipForwardFill,
  ArrowRepeat,
  BarChartLine,
  Download,
} from 'react-bootstrap-icons';
import Icon from '@chakra-ui/icon';
import { useActiveWorkout } from '../context/WorkoutContext';
import { ftpPercentFromWatt, wattFromFtpPercent } from '../utils';
import { Tooltip } from '@chakra-ui/tooltip';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { FormControl } from '@chakra-ui/form-control';
import { Lap } from '../types';
import { toTCX } from '../createTcxFile';
import { useSmartTrainer } from '../context/SmartTrainerContext';

const parseWattInput = (input: string) => {
  const parsed = parseFloat(input);

  if (isNaN(parsed)) return null;

  return Math.floor(parsed);
};

const parseFtpPercentInput = (input: string) => {
  const parsed = parseFloat(input);

  if (isNaN(parsed)) return null;

  return Math.floor(parsed * 10) / 10;
};
interface PowerInputData {
  power: number | null;
  wattInput: string;
  percentInput: string;
}

interface Props {
  start: () => void;
  stop: () => void;
  running: boolean;
  data: Lap[];
}
export const MainActionBar = ({ start, stop, running, data }: Props) => {
  const { activeFTP } = useActiveWorkout();
  const [showPowerControls, setShowPowerControls] = React.useState(false);
  const [showWorkoutControls, setShowWorkoutControls] = React.useState(false);

  const {
    isConnected: smartTrainerIsConnected,
    setResistance: setSmartTrainerResistance,
    requestPermission: connectToSmartTrainer,
    currentResistance,
  } = useSmartTrainer();

  const anyValidDataPoints = data.some((lap) =>
    lap.dataPoints.some((dataPoint) => dataPoint.heartRate || dataPoint.power)
  );
  const [powerInputData, dispatchPowerInputAction] = React.useReducer(
    (
      _currentData: PowerInputData,
      action: { value: string; type: 'watt' | 'ftp'; activeFtp: number }
    ): PowerInputData => {
      switch (action.type) {
        case 'ftp': {
          const ftpPercent = parseFtpPercentInput(action.value);

          if (ftpPercent === null || ftpPercent < 0)
            return {
              power: null,
              percentInput: action.value,
              wattInput: '',
            };

          const watt = wattFromFtpPercent(ftpPercent, action.activeFtp);
          return {
            power: ftpPercent,
            percentInput: action.value,
            wattInput: '' + watt,
          };
        }
        case 'watt': {
          const watt = parseWattInput(action.value);

          if (watt === null || watt < 0)
            return {
              power: null,
              wattInput: action.value,
              percentInput: '',
            };

          const ftpPercent = ftpPercentFromWatt(watt, action.activeFtp);
          return {
            power: ftpPercent,
            wattInput: action.value,
            percentInput: '' + ftpPercent,
          };
        }
      }
    },
    {
      power: activeFTP,
      wattInput: '' + activeFTP,
      percentInput: '100',
    }
  );

  const defaultResistancePercentages = [
    50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
  ];

  const canAddResistanceValue = (value: number) => {
    const watt = wattFromFtpPercent(value, activeFTP);

    return currentResistance + watt < 0 ? false : true;
  };

  const bgColor = useColorModeValue('gray.200', 'gray.900');
  return (
    <Center mb="5">
      <Stack p="5" borderRadius="1em" bgColor={bgColor} pointerEvents="auto">
        {showWorkoutControls ? (
          <Center>
            <HStack>
              <Tooltip label="Re-sync resistance" placement="top">
                <IconButton
                  size="sm"
                  aria-label="Re-sync resistance"
                  icon={<Icon as={ArrowRepeat} />}
                />
              </Tooltip>
              <Tooltip label="Previous part" placement="top">
                <IconButton
                  size="sm"
                  aria-label="Previous part"
                  icon={<Icon as={SkipBackwardFill} />}
                />
              </Tooltip>

              <Tooltip label="Go to start of the part" placement="top">
                <IconButton
                  size="sm"
                  aria-label="Go to start of the part"
                  icon={<Icon as={SkipStartFill} />}
                />
              </Tooltip>

              <Tooltip label="Pause workout timer" placement="top">
                <IconButton
                  size="sm"
                  aria-label="Pause workout timer"
                  icon={<Icon as={PauseFill} />}
                />
              </Tooltip>
              <Tooltip label="Next part" placement="top">
                <IconButton
                  size="sm"
                  aria-label="Next part"
                  icon={<Icon as={SkipForwardFill} />}
                />
              </Tooltip>
            </HStack>
          </Center>
        ) : null}
        {showPowerControls ? (
          <Center justifyContent="space-between">
            <Grid templateColumns="2fr 2fr 2fr" gap="1">
              <Tooltip
                label={`+${wattFromFtpPercent(1, activeFTP)}W (1%)`}
                placement="top"
              >
                <Button
                  onClick={() => {
                    if (!smartTrainerIsConnected) return;
                    const addWatt = wattFromFtpPercent(1, activeFTP);
                    setSmartTrainerResistance(currentResistance + addWatt);
                  }}
                  isDisabled={!smartTrainerIsConnected}
                  size="sm"
                  leftIcon={<Icon as={ArrowUp} />}
                >
                  1
                </Button>
              </Tooltip>
              <Tooltip
                label={`+${wattFromFtpPercent(5, activeFTP)}W (5%)`}
                placement="top"
              >
                <Button
                  onClick={() => {
                    if (!smartTrainerIsConnected) return;
                    const addWatt = wattFromFtpPercent(5, activeFTP);
                    setSmartTrainerResistance(currentResistance + addWatt);
                  }}
                  isDisabled={!smartTrainerIsConnected}
                  size="sm"
                  leftIcon={<Icon as={ArrowUp} />}
                >
                  5
                </Button>
              </Tooltip>
              <Tooltip
                label={`+${wattFromFtpPercent(10, activeFTP)}W (10%)`}
                placement="top"
              >
                <Button
                  onClick={() => {
                    if (!smartTrainerIsConnected) return;
                    const addWatt = wattFromFtpPercent(10, activeFTP);
                    setSmartTrainerResistance(currentResistance + addWatt);
                  }}
                  isDisabled={!smartTrainerIsConnected}
                  size="sm"
                  leftIcon={<Icon as={ArrowUp} />}
                >
                  10
                </Button>
              </Tooltip>

              <Tooltip
                label={`-${wattFromFtpPercent(1, activeFTP)}W (1%)`}
                placement="bottom"
              >
                <Button
                  onClick={() => {
                    if (!smartTrainerIsConnected) return;
                    const addWatt = wattFromFtpPercent(1, activeFTP);
                    setSmartTrainerResistance(currentResistance - addWatt);
                  }}
                  isDisabled={
                    !smartTrainerIsConnected || !canAddResistanceValue(-1)
                  }
                  size="sm"
                  leftIcon={<Icon as={ArrowDown} />}
                >
                  1
                </Button>
              </Tooltip>
              <Tooltip
                label={`-${wattFromFtpPercent(5, activeFTP)}W (5%)`}
                placement="bottom"
              >
                <Button
                  onClick={() => {
                    if (!smartTrainerIsConnected) return;
                    const addWatt = wattFromFtpPercent(5, activeFTP);
                    setSmartTrainerResistance(currentResistance - addWatt);
                  }}
                  isDisabled={
                    !smartTrainerIsConnected || !canAddResistanceValue(-5)
                  }
                  size="sm"
                  leftIcon={<Icon as={ArrowDown} />}
                >
                  5
                </Button>
              </Tooltip>
              <Tooltip
                label={`-${wattFromFtpPercent(10, activeFTP)}W (10%)`}
                placement="bottom"
              >
                <Button
                  onClick={() => {
                    if (!smartTrainerIsConnected) return;
                    const addWatt = wattFromFtpPercent(10, activeFTP);
                    setSmartTrainerResistance(currentResistance - addWatt);
                  }}
                  isDisabled={
                    !smartTrainerIsConnected || !canAddResistanceValue(-10)
                  }
                  size="sm"
                  leftIcon={<Icon as={ArrowDown} />}
                >
                  10
                </Button>
              </Tooltip>
            </Grid>
            <Grid
              templateColumns="1fr 1fr 1fr"
              templateRows="1fr 1fr"
              width="10em"
              gap="1"
            >
              <GridItem colSpan={2} rowSpan={1}>
                <FormControl isInvalid={powerInputData.power === null}>
                  <InputGroup size="sm">
                    <Input
                      placeholder="Watt"
                      type="number"
                      value={powerInputData.wattInput}
                      onChange={(e) =>
                        dispatchPowerInputAction({
                          type: 'watt',
                          value: e.target.value,
                          activeFtp: activeFTP,
                        })
                      }
                    />
                    <Tooltip label="Watt" placement="top">
                      <InputRightAddon children="W" />
                    </Tooltip>
                  </InputGroup>
                </FormControl>
              </GridItem>
              <GridItem colSpan={1} rowSpan={2}>
                <Tooltip
                  label={
                    powerInputData.power !== null
                      ? `Set resistance to ${wattFromFtpPercent(
                          powerInputData.power,
                          activeFTP
                        )}W (${powerInputData.power}% of FTP)`
                      : 'Set resistance'
                  }
                  placement="top"
                >
                  <Button
                    isDisabled={
                      !smartTrainerIsConnected || powerInputData.power === null
                    }
                    height="100%"
                    width="100%"
                    onClick={() => {
                      if (
                        !smartTrainerIsConnected ||
                        powerInputData.power === null
                      )
                        return;

                      setSmartTrainerResistance(
                        wattFromFtpPercent(powerInputData.power, activeFTP)
                      );
                    }}
                  >
                    Set
                  </Button>
                </Tooltip>
              </GridItem>
              <GridItem colSpan={2} rowSpan={1}>
                <FormControl isInvalid={powerInputData.power === null}>
                  <InputGroup size="sm">
                    <Input
                      placeholder="%FTP"
                      type="number"
                      value={powerInputData.percentInput}
                      onChange={(e) =>
                        dispatchPowerInputAction({
                          type: 'ftp',
                          value: e.target.value,
                          activeFtp: activeFTP,
                        })
                      }
                    />
                    <Tooltip
                      label={`% of FTP (${activeFTP}W)`}
                      placement="bottom"
                    >
                      <InputRightAddon children="%" />
                    </Tooltip>
                  </InputGroup>
                </FormControl>
              </GridItem>
            </Grid>
          </Center>
        ) : null}

        {!smartTrainerIsConnected ? (
          <Button variant="link" onClick={() => connectToSmartTrainer()}>
            Connect to Smart Trainer
          </Button>
        ) : null}
        <Grid templateColumns="1fr 1fr 1fr" gap="1" alignItems="end">
          <Center height="100%">
            <HStack>
              <Tooltip label="Load workout">
                <IconButton
                  aria-label="Load workout"
                  icon={<Icon as={BarChartLine} />}
                />
              </Tooltip>
              <Tooltip label="Show workout controls">
                <IconButton
                  aria-label="Show workout controls"
                  variant={showWorkoutControls ? 'outline' : 'solid'}
                  onClick={() => setShowWorkoutControls((current) => !current)}
                  icon={<Icon as={Grid3x2GapFill} />}
                />
              </Tooltip>
            </HStack>
          </Center>
          <Center width="8em">
            {running ? (
              <Button
                width="100%"
                size="lg"
                onClick={stop}
                leftIcon={<Icon as={PauseFill} />}
              >
                Pause
              </Button>
            ) : (
              <Button
                width="100%"
                size="lg"
                onClick={start}
                leftIcon={<Icon as={PlayFill} />}
              >
                {anyValidDataPoints ? 'Resume' : 'Start'}
              </Button>
            )}
          </Center>
          <Center height="100%">
            <HStack justifyContent="flex-end">
              <Tooltip label="Show power controls">
                <IconButton
                  aria-label="Show power controls"
                  variant={showPowerControls ? 'outline' : 'solid'}
                  onClick={() => setShowPowerControls((current) => !current)}
                  icon={<Icon as={Grid3x2GapFill} />}
                />
              </Tooltip>
              <Menu placement="top">
                <MenuList>
                  <Box>
                    {defaultResistancePercentages.map((percentage, i) => (
                      <MenuItem
                        key={i}
                        onClick={() =>
                          setSmartTrainerResistance(
                            wattFromFtpPercent(percentage, activeFTP)
                          )
                        }
                      >
                        {wattFromFtpPercent(percentage, activeFTP)}W (
                        {percentage}
                        %)
                      </MenuItem>
                    ))}
                  </Box>
                </MenuList>

                <Tooltip label="Quick power">
                  <MenuButton
                    isDisabled={!smartTrainerIsConnected}
                    icon={<Icon as={LightningChargeFill} />}
                    as={IconButton}
                    aria-label="Quick power"
                  />
                </Tooltip>
              </Menu>
            </HStack>
          </Center>
        </Grid>
        {anyValidDataPoints && !running ? (
          <Grid templateColumns="1fr 1fr 1fr" gap="1" colStart={1}>
            <Text />
            <Center width="8em">
              <Button
                width="100%"
                onClick={() => toTCX(data)}
                leftIcon={<Icon as={Download} />}
              >
                Save TCX
              </Button>
            </Center>
            <Text />
          </Grid>
        ) : null}
      </Stack>
    </Center>
  );
};
