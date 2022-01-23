import * as React from 'react';
import { useLogs } from '../context/LogContext';

export interface SmartTrainer {
  requestPermission: () => void;
  power: number | null;
  cadence: number | null;
  speed: number | null;
  isConnected: boolean;
  disconnect: () => void;
  setResistance: (resistance: number) => void;
  currentResistance: number;
}

interface SmartTrainerData {
  power: number | null;
  cadence: number | null;
  speed: number | null;
}
/* Information about the Bluetooth services: https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0/ */
export const useSmartTrainerInterface = (): SmartTrainer => {
  const [data, setData] = React.useState<SmartTrainerData>({
    power: 0,
    cadence: 0,
    speed: 0,
  });
  const [isConnected, setIsConnected] = React.useState(false);
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  const { logEvent } = useLogs();
  const [currentResistance, setCurrentResistance] = React.useState(0);

  const [fitnessMachineCharacteristic, setFitnessMachineCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const [indoorBikeDataCharacteristic, setIndoorBikeDataCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const handleIndoorBikeDataUpdate = (event: any) => {
    const data = event.target.value as DataView;

    /* NB: speed is only based on the rotation of the smart trainer's resistance unit, meaning that it is easier to get a higher speed
     *  when using less resistance. If we really want to use speed, we should do a do some trickery using the power, either calculating
     *  the speed solely on power or some hybrid using the smart trainer speed weighted with the power. I think 100% power based speed
     *  would be best. */
    const speed = (data.getUint8(2) + (data.getUint8(3) << 8)) / 100;
    const cadence = (data.getUint8(4) + (data.getUint8(5) << 8)) / 2;
    const power = data.getUint8(6) + (data.getUint8(7) << 8);
    setData({ power, cadence, speed });
  };

  const requestPermission = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['fitness_machine'] }], // Fitness machine 0x1826
    });

    setDevice(device);

    const server = await device?.gatt?.connect();

    const fitnessMachineService = await server?.getPrimaryService(
      'fitness_machine'
    );
    const fitnessMachineCharacteristic =
      await fitnessMachineService?.getCharacteristic(
        'fitness_machine_control_point'
      );
    await fitnessMachineCharacteristic?.writeValue(new Uint8Array([0x01]));

    await fitnessMachineCharacteristic?.writeValue(new Uint8Array([0x01]));

    fitnessMachineCharacteristic &&
      setFitnessMachineCharacteristic(fitnessMachineCharacteristic);

    const indoorBikeDataCharacteristic =
      await fitnessMachineService?.getCharacteristic('indoor_bike_data');

    await indoorBikeDataCharacteristic?.startNotifications();
    indoorBikeDataCharacteristic?.addEventListener(
      'characteristicvaluechanged',
      handleIndoorBikeDataUpdate
    );
    indoorBikeDataCharacteristic &&
      setIndoorBikeDataCharacteristic(indoorBikeDataCharacteristic);

    setIsConnected(true);
    logEvent('smart trainer connected');
  };
  const disconnect = async () => {
    if (indoorBikeDataCharacteristic) {
      await indoorBikeDataCharacteristic.stopNotifications();
      console.log('> Indoor bike data notifications stopped');
      indoorBikeDataCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        handleIndoorBikeDataUpdate
      );
      setIndoorBikeDataCharacteristic(null);
    }
    device?.gatt?.disconnect();
    setDevice(null);
    setIsConnected(false);
    logEvent('smart trainer disconnected');
  };

  return {
    requestPermission,
    disconnect,
    isConnected,
    power: isConnected ? data.power : 0,
    cadence: isConnected ? data.cadence : 0,
    speed: isConnected ? data.speed : 0,
    currentResistance,
    setResistance: React.useCallback(
      async (resistance: number) => {
        if (!isConnected) {
          logEvent(
            'tried to set resistance, but no smart trainer is connected'
          );
          return;
        }
        try {
          if (fitnessMachineCharacteristic) {
            if (!resistance) {
              // Reset
              await fitnessMachineCharacteristic.writeValue(
                new Uint8Array([0x01])
              );
              await fitnessMachineCharacteristic.writeValue(
                new Uint8Array([0x05, 0])
              );
              logEvent(`set resistance: 0W`);
              setCurrentResistance(0);
            } else {
              const resBuf = new Uint8Array(
                new Uint16Array([resistance]).buffer
              );
              const cmdBuf = new Uint8Array([0x05]);
              const combined = new Uint8Array(cmdBuf.length + resBuf.length);
              combined.set(cmdBuf);
              combined.set(resBuf, cmdBuf.length);
              await fitnessMachineCharacteristic.writeValue(combined);
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
      },
      [isConnected, logEvent, fitnessMachineCharacteristic]
    ),
  };
};
