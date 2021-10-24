import * as React from "react";

export const useSmartTrainer = () => {
  const [power, setPower] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const [fitnessMachineCharacteristic, setFitnessMachineCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [cyclingPowerCharacteristic, setCyclingPowerCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);

  const parsePower = (value: any) => {
    console.log("value:", value);
    const buffer = value.buffer ? value : new DataView(value);

    const flags = buffer.getUint8(0);
    console.log("flags:", flags.toString(16));

    const power = buffer.getInt16(1);
    console.log("power:", power);

    return power;
  };
  const handlePowerUpdate = (event: any) => {
    const power = parsePower(event.target.value);
    console.log("handlePowerUpdate");
    setPower(power);
  };
  const requestSmartTrainerPermission = async () => {
    const device = await navigator.bluetooth.requestDevice({
      // filters: [{ services: ["cycling_power"] }], // Cycling power 0x1818
      filters: [{ services: ["fitness_machine"] }], // Fitness machine 0x1826
    });

    console.log("CONNECTED AS FITNESS MACHINE");
    setDevice(device);
    const server = await device?.gatt?.connect();
    setIsConnected(true);

    const fitnessMachineService = await server?.getPrimaryService(
      "fitness_machine"
    );
    console.log("fitnessMachineService:", fitnessMachineService);
    const fitnessMachineCharacteristic =
      await fitnessMachineService?.getCharacteristic(
        "fitness_machine_control_point"
      );
    console.log(
      "connected to fitness_machine_control_point",
      fitnessMachineCharacteristic
    );
    console.log("Send 0x00 (Request control)");
    let res = await fitnessMachineCharacteristic?.writeValue(
      new Uint8Array([0x01])
    );
    console.log("0x00 sent. res:", res);

    console.log("Send 0x01 (Reset)");
    res = await fitnessMachineCharacteristic?.writeValue(new Uint8Array([0x01]));
    console.log("[0x04, 100] sent. res:", res);
    console.log("fitnessMachineCharacteristic:", fitnessMachineCharacteristic);

    fitnessMachineCharacteristic && setFitnessMachineCharacteristic(fitnessMachineCharacteristic);

    const cyclingPowerService = await server?.getPrimaryService("cycling_power");
    console.log("Power service:", cyclingPowerService);
    const cyclingPowerCharacteristic =
      await cyclingPowerService?.getCharacteristic("cycling_power_measurement");
    console.log("powerCharacteristic:", cyclingPowerCharacteristic);
    cyclingPowerCharacteristic && setCyclingPowerCharacteristic(cyclingPowerCharacteristic);

    await cyclingPowerCharacteristic?.startNotifications();
    cyclingPowerCharacteristic?.addEventListener(
      "characteristicvaluechanged",
      handlePowerUpdate
    );
  };
  const disconnect = async () => {
    console.log("cyclingPowerCharacteristic:", cyclingPowerCharacteristic);
    if (cyclingPowerCharacteristic) {
      await cyclingPowerCharacteristic.stopNotifications();
      console.log("> Cycling power notifications stopped");
      cyclingPowerCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        handlePowerUpdate
      );
      setCyclingPowerCharacteristic(null);
      device?.gatt?.disconnect();
    }
    setDevice(null);
    setIsConnected(false);
  };

  return {
    requestSmartTrainerPermission,
    disconnect,
    isConnected,
    power,
    setResistance: async (resistance: number) =>
      fitnessMachineCharacteristic &&
      fitnessMachineCharacteristic.writeValue(
        new Uint8Array([0x05, resistance])
      ),
  };
};
