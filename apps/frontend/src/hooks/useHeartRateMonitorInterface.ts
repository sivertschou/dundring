import { useToast } from '@chakra-ui/toast';
import * as React from 'react';
import { useLogs } from '../context/LogContext';

export interface HeartRateMonitorInterface {
  requestPermission: () => void;
  heartRate: number | null;
  isConnected: boolean;
  status: 'not_connected' | 'connecting' | 'connected' | 'error';
  disconnect: () => void;
}

interface SetHeartRateMeasurementCharacteristicAction {
  type: 'set_heart_rate_measurement_characteristics';
  device: BluetoothDevice;
  heartRateMeasurementCharacteristic: BluetoothRemoteGATTCharacteristic;
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
  | SetHeartRateMeasurementCharacteristicAction
  | SetConnectingAction
  | SetErrorAction
  | ResetAction;

type HeartRateMonitor =
  | { status: 'not_connected' }
  | { status: 'connecting' }
  | { status: 'error'; errorMessage: string }
  | {
      status: 'connected';
      device: BluetoothDevice;
      heartRateMeasurementCharacteristic: BluetoothRemoteGATTCharacteristic;
    };

const parseHeartRate = (value: DataView | ArrayBuffer) => {
  // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
  value = value instanceof DataView ? value : new DataView(value);
  let flags = value.getUint8(0);
  let rate16Bits = flags & 0x1;
  if (rate16Bits) {
    return value.getUint16(1, /*littleEndian=*/ true);
  } else {
    return value.getUint8(1);
  }
};

export const useHeartRateMonitorInterface = (): HeartRateMonitorInterface => {
  const [heartRate, setHeartRate] = React.useState<number | null>(null);
  const { logEvent } = useLogs();
  const toast = useToast();

  const hasAutomaticConnectionEnabled = 'getDevices' in navigator.bluetooth;

  const prevConnectedTrainerId =
    localStorage.getItem('prevConnectedHeartRateMonitorDevice') || null;

  console.log(prevConnectedTrainerId);

  const [heartRateMonitor, dispatch] = React.useReducer(
    (_current: HeartRateMonitor, action: Action): HeartRateMonitor => {
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
        case 'set_heart_rate_measurement_characteristics': {
          localStorage.setItem(
            'prevConnectedHeartRateMonitorDevice',
            action.device.id
          );
          return {
            status: 'connected',
            device: action.device,
            heartRateMeasurementCharacteristic:
              action.heartRateMeasurementCharacteristic,
          };
        }
      }
    },
    { status: 'not_connected' }
  );

  const handleHRUpdate = (event: any) => {
    const hr = parseHeartRate(event.target.value);
    setHeartRate(hr);
  };

  const onDisconnected = React.useCallback(() => {
    toast({
      title: 'HR Disconnected!',
      isClosable: true,
      duration: 2000,
      status: 'warning',
    });
    setHeartRate(null);
    dispatch({
      type: 'set_error',
      errorMessage: 'Disconnected',
    });
    logEvent('heart rate monitor auto-disconnected');
  }, []);

  React.useEffect(() => {
    if (!prevConnectedTrainerId || heartRateMonitor.status !== 'not_connected')
      return;
    const autoconnect = async () => {
      if (hasAutomaticConnectionEnabled) {
        const devices = await navigator.bluetooth.getDevices();
        const prevConnectedHeartRateMonitorDevice = devices.find(
          (d) => d.id === prevConnectedTrainerId
        );
        console.log(devices, prevConnectedHeartRateMonitorDevice);
        if (prevConnectedHeartRateMonitorDevice !== undefined) {
          dispatch({ type: 'set_connecting' });
          console.log(prevConnectedHeartRateMonitorDevice);
          const server =
            await prevConnectedHeartRateMonitorDevice.gatt?.connect();
          const service = await server?.getPrimaryService('heart_rate');

          const heartRateMeasurementCharacteristic =
            await service?.getCharacteristic('heart_rate_measurement');
          if (!heartRateMeasurementCharacteristic) {
            return dispatch({ type: 'reset' });
          }

          await heartRateMeasurementCharacteristic
            ?.startNotifications()
            .then((_) => {
              console.log('> Notifications started');
              heartRateMeasurementCharacteristic.addEventListener(
                'characteristicvaluechanged',
                handleHRUpdate
              );
            });
          prevConnectedHeartRateMonitorDevice.removeEventListener(
            'gattserverdisconnected',
            onDisconnected
          );
          prevConnectedHeartRateMonitorDevice.addEventListener(
            'gattserverdisconnected',
            onDisconnected
          );

          dispatch({
            type: 'set_heart_rate_measurement_characteristics',
            device: prevConnectedHeartRateMonitorDevice,
            heartRateMeasurementCharacteristic,
          });
        }
      }
    };
    autoconnect().catch(() => console.error('autoconnect failed'));
  }, []);

  const requestPermission = async () => {
    dispatch({ type: 'set_connecting' });
    const device = await navigator.bluetooth
      .requestDevice({
        filters: [{ services: ['heart_rate'] }],
      })
      .catch((_e) => {
        dispatch({ type: 'reset' });
        return null;
      });

    if (!device) return;

    const server = await device?.gatt?.connect();

    const service = await server?.getPrimaryService('heart_rate');

    if (!service) {
      return dispatch({
        type: 'set_error',
        errorMessage: 'Could not connect to heart rate service.',
      });
    }
    const heartRateMeasurementCharacteristic = await service?.getCharacteristic(
      'heart_rate_measurement'
    );

    if (!heartRateMeasurementCharacteristic) {
      return dispatch({
        type: 'set_error',
        errorMessage:
          'Could not connect to heart rate measurement characteristic.',
      });
    }

    await heartRateMeasurementCharacteristic?.startNotifications().then((_) => {
      console.log('> Notifications started');
      heartRateMeasurementCharacteristic.addEventListener(
        'characteristicvaluechanged',
        handleHRUpdate
      );
    });

    dispatch({
      type: 'set_heart_rate_measurement_characteristics',
      device,
      heartRateMeasurementCharacteristic,
    });

    device.removeEventListener('gattserverdisconnected', onDisconnected);
    device.addEventListener('gattserverdisconnected', onDisconnected);

    logEvent('heart rate monitor connected');
  };

  const disconnect = async () => {
    if (heartRateMonitor.status === 'connected') {
      await heartRateMonitor.heartRateMeasurementCharacteristic.stopNotifications();
      console.log('> Notifications stopped');
      heartRateMonitor.heartRateMeasurementCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        handleHRUpdate
      );
      heartRateMonitor.device.gatt?.disconnect();
      dispatch({ type: 'reset' });
    }
    logEvent('heart rate monitor disconnected');
  };
  const isConnected = heartRateMonitor.status === 'connected';
  return {
    requestPermission,
    disconnect,
    isConnected,
    heartRate: isConnected ? heartRate : null,
    status: heartRateMonitor.status,
  };
};
