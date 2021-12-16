import * as React from 'react';
import { useLogs } from '../context/LogContext';
import { randomIntFromIntervalBasedOnPrev } from '../utils';
import { HeartRateMonitor } from './useHeartRateMonitorInterface';

export const useHeartRateMonitorMock = (): HeartRateMonitor => {
  const [heartRate, setHeartRate] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const { add: addLog } = useLogs();

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setHeartRate((prev) =>
          randomIntFromIntervalBasedOnPrev(50, 200, prev, 20)
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    requestPermission: () => {
      setIsConnected(true);
      addLog('[mock] heart rate monitor connected');
    },
    disconnect: () => {
      setIsConnected(false);
      addLog('[mock] heart rate monitor disconnected');
    },
    isConnected,
    heartRate,
  };
};
