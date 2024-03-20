import * as React from 'react';
import { useLogs } from '../context/LogContext';
import {
  cleanupIndoorBikeData,
  reset,
  serviceUuids,
  setResistance,
  setup,
} from '../utils/ble/fitnessMachine';

export interface SmartTrainerInterface {
  requestPermission: () => void;
  power: number | null;
  cadence: number | null;
  speed: number | null;
  isConnected: boolean;
  status: 'not_connected' | 'connecting' | 'connected' | 'error';
  disconnect: () => void;
  setResistance: (resistance: number) => void;
  currentResistance: number;
}

interface SetFitnessMachineCharacteristicsAction {
  type: 'set_fitness_machine_characteristics';
  device: BluetoothDevice;
  fitnessMachineControlPointCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  indoorBikeDataCharacteristic: BluetoothRemoteGATTCharacteristic | null;
}

interface SetCyclingPowerCharacteristicsAction {
  type: 'set_cycling_power_characteristics';
  device: BluetoothDevice;
  cyclingPowerMeasurementCharacteristic: BluetoothRemoteGATTCharacteristic;
}

interface SetConnectingAction {
  type: 'set_connecting';
}

interface SetErrorAction {
  type: 'set_error';
  errorMessage: string;
}

interface ResetAction {
  type: 'reset';
}
type Action =
  | SetFitnessMachineCharacteristicsAction
  | SetCyclingPowerCharacteristicsAction
  | SetConnectingAction
  | SetErrorAction
  | ResetAction;

interface FitnessMachineService {
  type: 'fitness_machine';
  fitnessMachineControlPointCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  indoorBikeDataCharacteristic: BluetoothRemoteGATTCharacteristic | null;
}
interface CyclingPowerService {
  type: 'cycling_power';
  cyclingPowerMeasurementCharacteristic: BluetoothRemoteGATTCharacteristic;
}

type Service = FitnessMachineService | CyclingPowerService;

type SmartTrainer =
  | { status: 'not_connected' }
  | { status: 'connecting' }
  | { status: 'error'; errorMessage: string }
  | { status: 'connected'; device: BluetoothDevice; service: Service };

export interface SmartTrainerData {
  power: number | null;
  cadence: number | null;
  speed: number | null;
}

/* Information about the Bluetooth services: https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0/ */
export const useSmartTrainerInterface = (): SmartTrainerInterface => {
  const [data, setData] = React.useState<SmartTrainerData>({
    power: null,
    cadence: null,
    speed: null,
  });
  const { logEvent } = useLogs();
  const [currentResistance, setCurrentResistance] = React.useState(0);

  const [smartTrainer, dispatch] = React.useReducer(
    (_current: SmartTrainer, action: Action): SmartTrainer => {
      switch (action.type) {
        case 'reset': {
          return { status: 'not_connected' };
        }
        case 'set_connecting': {
          return { status: 'connecting' };
        }
        case 'set_error': {
          return { status: 'error', errorMessage: action.errorMessage };
        }
        case 'set_cycling_power_characteristics': {
          return {
            status: 'connected',
            device: action.device,
            service: {
              type: 'cycling_power',
              cyclingPowerMeasurementCharacteristic:
                action.cyclingPowerMeasurementCharacteristic,
            },
          };
        }
        case 'set_fitness_machine_characteristics': {
          return {
            status: 'connected',
            device: action.device,
            service: {
              type: 'fitness_machine',
              fitnessMachineControlPointCharacteristic:
                action.fitnessMachineControlPointCharacteristic,
              indoorBikeDataCharacteristic: action.indoorBikeDataCharacteristic,
            },
          };
        }
      }
    },
    { status: 'not_connected' }
  );

  const requestPermission = async () => {
    dispatch({ type: 'set_connecting' });

    const device = await navigator.bluetooth
      .requestDevice({
        filters: [
          { services: [serviceUuids.fitnessMachine] },
          { services: [serviceUuids.cyclingPower] },
        ],
      })
      .catch((_e) => {
        dispatch({ type: 'reset' });
        return null;
      });

    if (!device?.gatt) return;

    const server = await device.gatt.connect();

    try {
      const fitnessMachine = await setup(server, setData);

      dispatch({
        type: 'set_fitness_machine_characteristics',
        device: fitnessMachine.device,
        fitnessMachineControlPointCharacteristic: fitnessMachine.controlPoint,
        indoorBikeDataCharacteristic: fitnessMachine.indoorBikeData,
      });
    } catch (e) {
      console.error(e);
    }

    logEvent('smart trainer connected');
  };

  const disconnect = async () => {
    if (smartTrainer.status === 'connected') {
      switch (smartTrainer.service.type) {
        case 'fitness_machine': {
          if (smartTrainer.service.indoorBikeDataCharacteristic)
            smartTrainer.service.indoorBikeDataCharacteristic.stopNotifications();
        }
      }
      smartTrainer.device.gatt?.disconnect();
      dispatch({ type: 'reset' });
    }

    logEvent('smart trainer disconnected');
  };

  const isConnected = smartTrainer.status === 'connected';
  return {
    requestPermission,
    disconnect,
    status: smartTrainer.status,
    isConnected,
    power: isConnected ? data.power : null,
    cadence: isConnected ? data.cadence : null,
    speed: isConnected ? data.speed : null,
    currentResistance,
    setResistance: React.useCallback(
      async (resistance: number) => {
        if (!isConnected) {
          logEvent(
            'tried to set resistance, but no smart trainer is connected'
          );
          return;
        }
        if (smartTrainer.service.type === 'fitness_machine') {
          try {
            const fitnessMachineControlPointCharacteristic =
              smartTrainer.service.fitnessMachineControlPointCharacteristic;
            if (fitnessMachineControlPointCharacteristic) {
              if (!resistance) {
                await reset(fitnessMachineControlPointCharacteristic);
                logEvent('reset fitness machine');
                // setCurrentResistance(0);
              } else {
                await setResistance(
                  fitnessMachineControlPointCharacteristic,
                  resistance
                );
                logEvent(`set resistance: ${resistance}W`);
                setCurrentResistance(resistance);
              }
            }
          } catch (error) {
            if (error) {
              console.error(`Tried setting resistance, but got error:`, error);
              logEvent(`failed to set resistance: ${resistance}W`);
            }
          }
        }
      },
      [isConnected, logEvent, smartTrainer]
    ),
  };
};
