import * as React from "react";

export const useSmartTrainer = () => {
  const [power, setPower] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const [characteristic, setCharacteristic] = React.useState(null);
  const [device, setDevice] = React.useState(null);

  const parsePower = (value) => {
    console.log("value:", value);
    const buffer = value.buffer ? value : new DataView(value);

    const flags = buffer.getUint8(0);
    console.log("flags:", flags.toString(16));

    const power = buffer.getInt16(1);
    console.log("power:", power);

    // console.log("flags & 0x01:", flags & 0x01);
    // console.log("flags & 0x02:", flags & 0x02);
    // console.log("flags & 0x04:", flags & 0x04);
    // console.log("flags & 0x08:", flags & 0x08);
    // console.log("flags & 0x10:", flags & 0x10);
    // console.log("flags & 0x20:", flags & 0x20);

    // const crankRevolutionDataPresent = (flags & 0x10) !== 0;
    // console.log("crankRevolutionDataPresent:", crankRevolutionDataPresent);

    // const wheelRevolutionDataPresent = (flags & 0x20) !== 0;
    // console.log("wheelRevolutionDataPresent:", wheelRevolutionDataPresent);

    // const accumulatedTorque = buffer.getInt16(2);
    // console.log("accumulatedTorque:", accumulatedTorque);

    // const cumWheelRev = buffer.getInt16(3);
    // console.log("cumWheelRev:", cumWheelRev);

    // const cumCrankRev = buffer.getInt16(6);
    // console.log("cumCrankRev:", cumCrankRev);

    return power;
  };
  const handlePowerUpdate = (event) => {
    const power = parsePower(event.target.value);
    console.log("handlePowerUpdate");
    setPower(power);
  };
  const requestSmartTrainerPermission = async () => {
    navigator.bluetooth
      .requestDevice({ filters: [{ services: ["cycling_power"] }] })
      .then((device) => {
        setDevice(device);
        return device.gatt.connect();
      })
      .then((server) => {
        setIsConnected(true);
        return server.getPrimaryService("cycling_power");
      })
      .then((service) => {
        return service.getCharacteristic("cycling_power_measurement");
      })
      .then((characteristic) => {
        setCharacteristic(characteristic);
        return characteristic.startNotifications().then((_) => {
          console.log("> Notifications started");
          characteristic.addEventListener(
            "characteristicvaluechanged",
            handlePowerUpdate
          );
        });
      })
      .catch((error) => {
        console.log("Argh! " + error);
      });
  };
  const disconnect = () => {
    console.log("characteristic:", characteristic);
    if (characteristic) {
      characteristic
        .stopNotifications()
        .then((_) => {
          console.log("> Notifications stopped");
          characteristic.removeEventListener(
            "characteristicvaluechanged",
            handlePowerUpdate
          );
          setCharacteristic(null);
          device.gatt.disconnect();
          setDevice(null);
          setIsConnected(false);
        })
        .catch((error) => {
          console.log("Argh! " + error);
        });
    }
  };

  return { requestSmartTrainerPermission, disconnect, isConnected, power };
};
