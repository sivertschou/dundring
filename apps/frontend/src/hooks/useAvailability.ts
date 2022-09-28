import * as React from 'react';

export const useAvailability = () => {
  const [bluetoothAvailable, setBluetoothAvailable] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(true);
    if (!navigator.bluetooth) {
      setBluetoothAvailable(false);
      setLoading(false);
    } else {
      navigator.bluetooth.getAvailability().then((res) => {
        setBluetoothAvailable(res);
        setLoading(false);
      });
    }
  }, []);
  return { available: bluetoothAvailable, loading };
};
