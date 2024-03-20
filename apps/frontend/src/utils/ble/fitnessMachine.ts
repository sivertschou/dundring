import { SmartTrainerData } from '../../hooks/useSmartTrainerInterface';
import { nthBit } from '../bit';

export const serviceUuids = {
  cyclingPower: '00001818-0000-1000-8000-00805f9b34fb',
  fitnessMachine: '00001826-0000-1000-8000-00805f9b34fb',
};

const characteristicUuids = {
  fitnessMachineControlPoint: '00002ad9-0000-1000-8000-00805f9b34fb',
  fitnessMachineFeature: '00002acc-0000-1000-8000-00805f9b34fb',
  indoorBikeData: '00002ad2-0000-1000-8000-00805f9b34fb',
};

export const setup = async (
  server: BluetoothRemoteGATTServer,
  onData: (data: SmartTrainerData) => void
): Promise<{
  device: BluetoothDevice;
  controlPoint: BluetoothRemoteGATTCharacteristic | null;
  indoorBikeData: BluetoothRemoteGATTCharacteristic | null;
}> => {
  const service = await server.getPrimaryService(serviceUuids.fitnessMachine);

  if (!service)
    return { device: server.device, controlPoint: null, indoorBikeData: null };

  const data = await setupFitnessMachineService(service, onData);

  return {
    device: server.device,
    controlPoint: data?.controlPoint,
    indoorBikeData: data?.indoorBikeData,
  };
};

const setupFitnessMachineService = async (
  service: BluetoothRemoteGATTService,
  onData: (data: SmartTrainerData) => void
): Promise<{
  controlPoint: BluetoothRemoteGATTCharacteristic | null;
  indoorBikeData: BluetoothRemoteGATTCharacteristic | null;
}> => {
  const characteristics = await service.getCharacteristics();
  let availableFeatures = null;
  let controlPoint: BluetoothRemoteGATTCharacteristic | null = null;
  let indoorBikeData: BluetoothRemoteGATTCharacteristic | null = null;
  await Promise.all(
    characteristics.map(async (characteristic) => {
      console.log('characteristic:', characteristic.uuid);
      switch (characteristic.uuid) {
        case characteristicUuids.fitnessMachineFeature:
          availableFeatures = await getAvailableFeatures(characteristic);
          break;
        case characteristicUuids.fitnessMachineControlPoint:
          controlPoint = characteristic;
          break;
        case characteristicUuids.indoorBikeData:
          indoorBikeData = characteristic;
          break;
      }
    })
  );

  console.log('Available features:', availableFeatures);
  if (controlPoint) requestControl(controlPoint);
  if (indoorBikeData) setupIndoorBikeData(indoorBikeData, onData);
  return { controlPoint, indoorBikeData };
};

const getAvailableFeatures = async (
  characteristic: BluetoothRemoteGATTCharacteristic
) => {
  const flags = await characteristic.readValue();
  const features = flags.getUint32(0, true);
  const targets = flags.getUint32(4, true);

  return {
    readCadence: nthBit(features, 1),
    readPower: nthBit(features, 14),
    setResistance: nthBit(targets, 2),
  };
};

const requestControl = async (
  characteristic: BluetoothRemoteGATTCharacteristic
) => {
  console.log('request control:', characteristic);
  characteristic.writeValue(new Uint8Array([0x00]));
};

const setupIndoorBikeData = async (
  characteristic: BluetoothRemoteGATTCharacteristic,
  onData: (data: SmartTrainerData) => void
) => {
  console.log('setup indoor bike data', characteristic);
  await characteristic.startNotifications();
  characteristic.addEventListener(
    'characteristicvaluechanged',
    (event: any) => {
      const data = handleIndoorBikeDataValueChanged(event);
      if (data) onData(data);
    }
  );
};

const handleIndoorBikeDataValueChanged = (event: any) => {
  if (!event?.target?.value) return null;

  const data = event.target.value as DataView;

  const ret = {
    speed: getSpeed(data),
    cadence: getCadence(data),
    power: getPower(data),
  };
  return ret;
};

const flagSize = 2;

const speed = {
  isPresent: (flags: number) => !nthBit(flags, 0),
  index: (_flags: number) => flagSize,
  size: 2,
};

const averageSpeed = {
  isPresent: (flags: number) => nthBit(flags, 1),
  size: 2,
};

const cadence = {
  isPresent: (flags: number) => nthBit(flags, 2),
  size: 2,
  index: (flags: number) => {
    let index = flagSize;
    if (speed.isPresent(flags)) index += speed.size;
    if (averageSpeed.isPresent(flags)) index += averageSpeed.size;
    return index;
  },
};

const averageCadence = {
  isPresent: (flags: number) => nthBit(flags, 3),
  size: 2,
};

const distance = {
  isPresent: (flags: number) => nthBit(flags, 4),
  size: 3,
};

const resistance = {
  isPresent: (flags: number) => nthBit(flags, 5),
  size: 2,
};

const power = {
  isPresent: (flags: number) => nthBit(flags, 6),
  size: 2,
  index: (flags: number) => {
    let index = flagSize;
    if (speed.isPresent(flags)) index += speed.size;
    if (averageSpeed.isPresent(flags)) index += averageSpeed.size;
    if (cadence.isPresent(flags)) index += cadence.size;
    if (averageCadence.isPresent(flags)) index += averageCadence.size;
    if (distance.isPresent(flags)) index += distance.size;
    if (resistance.isPresent(flags)) index += resistance.size;
    return index;
  },
};

const getSpeed = (data: DataView) => {
  const flags = data.getUint16(0, true);
  if (!speed.isPresent(flags)) return null;
  return data.getUint16(speed.index(flags), true) / 100;
};

const getCadence = (data: DataView) => {
  const flags = data.getUint16(0, true);
  if (!cadence.isPresent(flags)) return null;
  return data.getUint16(cadence.index(flags), true) / 2;
};

const getPower = (data: DataView) => {
  const flags = data.getUint16(0, true);
  if (!power.isPresent(flags)) return null;
  return data.getUint16(power.index(flags), true);
};

export const setResistance = async (
  characteristic: BluetoothRemoteGATTCharacteristic,
  resistance: number
) => {
  const view = new DataView(new ArrayBuffer(3));

  view.setUint8(0, 0x05);
  view.setInt16(1, resistance, true);

  return characteristic.writeValue(view.buffer);
};

export const reset = async (
  characteristic: BluetoothRemoteGATTCharacteristic
) => {
  const view = new DataView(new ArrayBuffer(1));

  view.setUint8(0, 0x01);

  return characteristic.writeValue(view.buffer);
};
