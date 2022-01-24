import * as React from 'react';
import {
  Button,
  Center,
  FormControl,
  Grid,
  GridItem,
  Icon,
  Input,
  InputGroup,
  InputRightAddon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { ftpPercentFromWatt, wattFromFtpPercent } from '../../utils';
import { useSmartTrainer } from '../../context/SmartTrainerContext';
import { ArrowDown, ArrowUp } from 'react-bootstrap-icons';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';

interface PowerInputData {
  power: number | null;
  wattInput: string;
  percentInput: string;
}

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

export const PowerControls = () => {
  const {
    isConnected: smartTrainerIsConnected,
    setResistance: setSmartTrainerResistance,
    currentResistance,
  } = useSmartTrainer();

  const { activeFtp } = useActiveWorkout();

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
      power: activeFtp,
      wattInput: '' + activeFtp,
      percentInput: '100',
    }
  );

  React.useEffect(() => {
    dispatchPowerInputAction({
      type: 'ftp',
      value: '' + powerInputData.power,
      activeFtp,
    });
  }, [activeFtp, powerInputData.power]);

  const canAddResistanceValue = (value: number) => {
    const watt = wattFromFtpPercent(value, activeFtp);

    return currentResistance + watt < 0 ? false : true;
  };
  return (
    <Stack>
      <Text fontSize="xs" fontWeight="bold" opacity="0.5">
        Power controls
      </Text>
      <Center justifyContent="space-between">
        <Grid templateColumns="2fr 2fr 2fr" gap="1">
          <Tooltip
            label={`+${wattFromFtpPercent(1, activeFtp)}W (1%)`}
            placement="top"
          >
            <Button
              onClick={() => {
                if (!smartTrainerIsConnected) return;
                const addWatt = wattFromFtpPercent(1, activeFtp);
                setSmartTrainerResistance(currentResistance + addWatt);
              }}
              isDisabled={!smartTrainerIsConnected}
              size="sm"
              leftIcon={<Icon as={ArrowUp} />}
              paddingX="2"
            >
              1%
            </Button>
          </Tooltip>
          <Tooltip
            label={`+${wattFromFtpPercent(5, activeFtp)}W (5%)`}
            placement="top"
          >
            <Button
              onClick={() => {
                if (!smartTrainerIsConnected) return;
                const addWatt = wattFromFtpPercent(5, activeFtp);
                setSmartTrainerResistance(currentResistance + addWatt);
              }}
              isDisabled={!smartTrainerIsConnected}
              size="sm"
              leftIcon={<Icon as={ArrowUp} />}
              paddingX="2"
            >
              5%
            </Button>
          </Tooltip>
          <Tooltip
            label={`+${wattFromFtpPercent(10, activeFtp)}W (10%)`}
            placement="top"
          >
            <Button
              onClick={() => {
                if (!smartTrainerIsConnected) return;
                const addWatt = wattFromFtpPercent(10, activeFtp);
                setSmartTrainerResistance(currentResistance + addWatt);
              }}
              isDisabled={!smartTrainerIsConnected}
              size="sm"
              leftIcon={<Icon as={ArrowUp} />}
              paddingX="2"
            >
              10%
            </Button>
          </Tooltip>

          <Tooltip
            label={`-${wattFromFtpPercent(1, activeFtp)}W (1%)`}
            placement="bottom"
          >
            <Button
              onClick={() => {
                if (!smartTrainerIsConnected) return;
                const addWatt = wattFromFtpPercent(1, activeFtp);
                setSmartTrainerResistance(currentResistance - addWatt);
              }}
              isDisabled={
                !smartTrainerIsConnected || !canAddResistanceValue(-1)
              }
              size="sm"
              leftIcon={<Icon as={ArrowDown} />}
              paddingX="2"
            >
              1%
            </Button>
          </Tooltip>
          <Tooltip
            label={`-${wattFromFtpPercent(5, activeFtp)}W (5%)`}
            placement="bottom"
          >
            <Button
              onClick={() => {
                if (!smartTrainerIsConnected) return;
                const addWatt = wattFromFtpPercent(5, activeFtp);
                setSmartTrainerResistance(currentResistance - addWatt);
              }}
              isDisabled={
                !smartTrainerIsConnected || !canAddResistanceValue(-5)
              }
              size="sm"
              leftIcon={<Icon as={ArrowDown} />}
              paddingX="2"
            >
              5%
            </Button>
          </Tooltip>
          <Tooltip
            label={`-${wattFromFtpPercent(10, activeFtp)}W (10%)`}
            placement="bottom"
          >
            <Button
              onClick={() => {
                if (!smartTrainerIsConnected) return;
                const addWatt = wattFromFtpPercent(10, activeFtp);
                setSmartTrainerResistance(currentResistance - addWatt);
              }}
              isDisabled={
                !smartTrainerIsConnected || !canAddResistanceValue(-10)
              }
              size="sm"
              leftIcon={<Icon as={ArrowDown} />}
              paddingX="2"
            >
              10%
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
                      activeFtp: activeFtp,
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
                      activeFtp
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
                  if (!smartTrainerIsConnected || powerInputData.power === null)
                    return;

                  setSmartTrainerResistance(
                    wattFromFtpPercent(powerInputData.power, activeFtp)
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
                      activeFtp: activeFtp,
                    })
                  }
                />
                <Tooltip label={`% of FTP (${activeFtp}W)`} placement="bottom">
                  <InputRightAddon children="%" />
                </Tooltip>
              </InputGroup>
            </FormControl>
          </GridItem>
        </Grid>
      </Center>
    </Stack>
  );
};
