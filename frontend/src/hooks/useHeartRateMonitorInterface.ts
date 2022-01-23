import * as React from 'react';
import { useLogs } from '../context/LogContext';

export interface HeartRateMonitor {
  requestPermission: () => void;
  heartRate: number | null;
  isConnected: boolean;
  disconnect: () => void;
}

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
export const useHeartRateMonitorInterface = (): HeartRateMonitor => {
  const [heartRate, setHeartRate] = React.useState<number | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  const { logEvent } = useLogs();

  const [characteristic, setCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const handleHRUpdate = (event: any) => {
    const hr = parseHeartRate(event.target.value);
    setHeartRate(hr);
  };
  const requestPermission = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
    });
    setDevice(device);

    const server = await device?.gatt?.connect();

    const service = await server?.getPrimaryService('heart_rate');

    const characteristic = await service?.getCharacteristic(
      'heart_rate_measurement'
    );

    characteristic && setCharacteristic(characteristic);

    await characteristic?.startNotifications().then((_) => {
      console.log('> Notifications started');
      characteristic.addEventListener(
        'characteristicvaluechanged',
        handleHRUpdate
      );
    });

    setIsConnected(true);
    logEvent('heart rate monitor connected');
  };
  const disconnect = async () => {
    if (characteristic) {
      await characteristic.stopNotifications();

      console.log('> Notifications stopped');
      characteristic.removeEventListener(
        'characteristicvaluechanged',
        handleHRUpdate
      );
      setCharacteristic(null);
      device?.gatt?.disconnect();
    }
    setDevice(null);
    setIsConnected(false);
    logEvent('heart rate monitor disconnected');
  };

  return {
    requestPermission,
    disconnect,
    isConnected,
    heartRate: isConnected ? heartRate : null,
  };
};
