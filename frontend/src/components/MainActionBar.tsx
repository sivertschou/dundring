import * as React from 'react';

import {
  Center,
  Stack,
  Box,
  Grid,
  Text,
  HStack,
  GridItem,
} from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';
import {
  ArrowDown,
  ArrowUp,
  LightningChargeFill,
  PlayFill,
  SaveFill,
  Grid3x2GapFill,
  SkipBackwardFill,
  SkipStartFill,
  PauseFill,
  SkipForwardFill,
  ArrowRepeat,
  BarChartLine,
} from 'react-bootstrap-icons';
import Icon from '@chakra-ui/icon';
import { useActiveWorkout } from '../context/WorkoutContext';
import { ftpPercentFromWatt, wattFromFtpPercent } from '../utils';
import { Tooltip } from '@chakra-ui/tooltip';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { FormControl } from '@chakra-ui/form-control';

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

export const MainActionBar = () => {
  const { activeFTP } = useActiveWorkout();
  const [showPowerControls, setShowPowerControls] = React.useState(false);
  const [showWorkoutControls, setShowWorkoutControls] = React.useState(false);

  const [powerInputData, dispatchPowerInputAction] = React.useReducer(
    (
      _currentData: PowerInputData,
      action: { value: string; type: 'watt' | 'ftp'; activeFtp: number }
    ): PowerInputData => {
      switch (action.type) {
        case 'ftp': {
          const ftpPercent = parseFtpPercentInput(action.value);

          if (ftpPercent === null)
            return {
              power: null,
              percentInput: action.value,
              wattInput: '',
            };

          const watt = wattFromFtpPercent(ftpPercent, action.activeFtp);
          return {
            power: ftpPercent,
            wattInput: '' + watt,
            percentInput: action.value,
          };
        }
        case 'watt': {
          const watt = parseWattInput(action.value);

          if (watt === null)
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

  // const bgColor = useColorModeValue('white', 'gray.800');

  const bgColor = useColorModeValue('gray.200', 'gray.900');
  return (
    <Center mb="5">
      <Stack p="5" borderRadius="1em" bgColor={bgColor} pointerEvents="auto">
        {showWorkoutControls ? (
          <Center>
            <HStack>
              <Tooltip label="Re-sync resistance">
                <IconButton
                  size="sm"
                  aria-label="Re-sync resistance"
                  icon={<Icon as={ArrowRepeat} />}
                />
              </Tooltip>
              <Tooltip label="Previous part">
                <IconButton
                  size="sm"
                  aria-label="Previous part"
                  icon={<Icon as={SkipBackwardFill} />}
                />
              </Tooltip>

              <Tooltip label="Go to start of the part">
                <IconButton
                  size="sm"
                  aria-label="Go to start of the part"
                  icon={<Icon as={SkipStartFill} />}
                />
              </Tooltip>

              <Tooltip label="Pause workout timer">
                <IconButton
                  size="sm"
                  aria-label="Pause workout timer"
                  icon={<Icon as={PauseFill} />}
                />
              </Tooltip>
              <Tooltip label="Next part">
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
              <Tooltip label={`+${wattFromFtpPercent(1, activeFTP)}W (1%)`}>
                <Button size="sm" leftIcon={<Icon as={ArrowUp} />}>
                  1
                </Button>
              </Tooltip>
              <Tooltip label={`+${wattFromFtpPercent(5, activeFTP)}W (5%)`}>
                <Button size="sm" leftIcon={<Icon as={ArrowUp} />}>
                  5
                </Button>
              </Tooltip>
              <Tooltip label={`+${wattFromFtpPercent(10, activeFTP)}W (10%)`}>
                <Button size="sm" leftIcon={<Icon as={ArrowUp} />}>
                  10
                </Button>
              </Tooltip>

              <Tooltip label={`-${wattFromFtpPercent(1, activeFTP)}W (1%)`}>
                <Button size="sm" leftIcon={<Icon as={ArrowDown} />}>
                  1
                </Button>
              </Tooltip>
              <Tooltip label={`-${wattFromFtpPercent(5, activeFTP)}W (5%)`}>
                <Button size="sm" leftIcon={<Icon as={ArrowDown} />}>
                  5
                </Button>
              </Tooltip>
              <Tooltip label={`-${wattFromFtpPercent(10, activeFTP)}W (10%)`}>
                <Button size="sm" leftIcon={<Icon as={ArrowDown} />}>
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
                    <InputRightAddon children="W" />
                  </InputGroup>
                </FormControl>
              </GridItem>
              <GridItem colSpan={1} rowSpan={2}>
                <Button
                  isDisabled={powerInputData.power === null}
                  height="100%"
                  width="100%"
                >
                  Set
                </Button>
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
                    <InputRightAddon children="%" />
                  </InputGroup>
                </FormControl>
              </GridItem>
            </Grid>
          </Center>
        ) : null}
        <Grid templateColumns="1fr 1fr 1fr" gap="1" alignItems="end">
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
          <Center>
            <Button size="lg" leftIcon={<Icon as={PlayFill} />}>
              Start
            </Button>
          </Center>

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
                    <MenuItem key={i}>
                      {wattFromFtpPercent(percentage, activeFTP)}W ({percentage}
                      %)
                    </MenuItem>
                  ))}
                </Box>
              </MenuList>

              <Tooltip label="Quick power">
                <MenuButton
                  icon={<Icon as={LightningChargeFill} />}
                  as={IconButton}
                  aria-label="Quick power"
                />
              </Tooltip>
            </Menu>
          </HStack>
        </Grid>

        <Text>Active FTP: {activeFTP} </Text>
      </Stack>
    </Center>
  );
};
