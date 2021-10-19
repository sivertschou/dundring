import * as React from "react";

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
export const useHeartRateMonitor = () => {
  const [heartRate, setHeartRate] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const [characteristic, setCharacteristic] = React.useState<BluetoothRemoteGATTCharacteristic | undefined>(undefined);
  const [device, setDevice] = React.useState<BluetoothDevice | null>(null);

  const handleHRUpdate = (event: any) => {
    const hr = parseHeartRate(event.target.value);
    console.log("handleHRUpdate");
    setHeartRate(hr);
  };
  const requestHRPermission = async () => {
    navigator.bluetooth
      .requestDevice({ filters: [{ services: ["heart_rate"] }] })
      .then((device) => {
        setDevice(device);
        return device?.gatt?.connect();
      })
      .then((server) => {
        setIsConnected(true);
        return server?.getPrimaryService("heart_rate");
      })
      .then((service) => {
        return service?.getCharacteristic("heart_rate_measurement");
      })
      .then((characteristic) => {
        setCharacteristic(characteristic);
        return characteristic?.startNotifications().then((_) => {
          console.log("> Notifications started");
          characteristic.addEventListener(
            "characteristicvaluechanged",
            handleHRUpdate
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
            handleHRUpdate
          );
          setCharacteristic(undefined);
          device?.gatt?.disconnect();
          setDevice(null);
          setIsConnected(false);
        })
        .catch((error) => {
          console.log("Argh! " + error);
        });
    }
  };

  return { requestHRPermission, disconnect, isConnected, heartRate };
};
