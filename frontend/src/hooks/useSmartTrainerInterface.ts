import * as React from 'react';
import { useLogs } from '../context/LogContext';

export interface SmartTrainer {
  requestPermission: () => void;
  power: number;
  isConnected: boolean;
  disconnect: () => void;
  setResistance: (resistance: number) => void;
}

const parsePower = (value: any) => {
  const buffer = value.buffer ? value : new DataView(value);

  const powerLSB = buffer.getUint8(2);
  const powerMSB = buffer.getUint8(3);
  const power = powerLSB + powerMSB * 256;

  return power;
};

export const useSmartTrainerInterface = (): SmartTrainer => {
  const [power, setPower] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);
  const { add: addLog } = useLogs();

  const [fitnessMachineCharacteristic, setFitnessMachineCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const [cyclingPowerCharacteristic, setCyclingPowerCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const handlePowerUpdate = (event: any) => {
    const power = parsePower(event.target.value);
    setPower(power);
  };

  const requestPermission = async () => {
    const device = await navigator.bluetooth.requestDevice({
      // filters: [{ services: ["cycling_power"] }], // Cycling power 0x1818
      filters: [{ services: ['fitness_machine'] }], // Fitness machine 0x1826
      optionalServices: ['cycling_power'],
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

    const cyclingPowerService = await server?.getPrimaryService(
      'cycling_power'
    );
    const cyclingPowerCharacteristic =
      await cyclingPowerService?.getCharacteristic('cycling_power_measurement');
    cyclingPowerCharacteristic &&
      setCyclingPowerCharacteristic(cyclingPowerCharacteristic);

    await cyclingPowerCharacteristic?.startNotifications();
    cyclingPowerCharacteristic?.addEventListener(
      'characteristicvaluechanged',
      handlePowerUpdate
    );
    setIsConnected(true);
    addLog('smart trainer connected');
  };
  const disconnect = async () => {
    if (cyclingPowerCharacteristic) {
      await cyclingPowerCharacteristic.stopNotifications();
      console.log('> Cycling power notifications stopped');
      cyclingPowerCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        handlePowerUpdate
      );
      setCyclingPowerCharacteristic(null);
      device?.gatt?.disconnect();
    }
    setDevice(null);
    setIsConnected(false);
    addLog('smart trainer disconnected');
  };

  return {
    requestPermission,
    disconnect,
    isConnected,
    power,
    setResistance: async (resistance: number) => {
      if (!isConnected) {
        addLog('tried to set resistance, but no smart trainer is connected');
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
            addLog(`set resistance: 0W`);
          } else {
            const resBuf = new Uint8Array(new Uint16Array([resistance]).buffer);
            const cmdBuf = new Uint8Array([0x05]);
            const combined = new Uint8Array(cmdBuf.length + resBuf.length);
            combined.set(cmdBuf);
            combined.set(resBuf, cmdBuf.length);
            await fitnessMachineCharacteristic.writeValue(combined);
            addLog(`set resistance: ${resistance}W`);
          }
        }
      } catch (error) {
        if (error) {
          console.error(`Tried setting resistance, but got error:`, error);
          addLog(`failed to set resistance: ${resistance}W`);
        }
      }
    },
  };
};
