import * as React from 'react';
import { useLogs } from '../context/LogContext';
import { randomIntFromIntervalBasedOnPrev } from '../utils/general';
import { HeartRateMonitorInterface } from './useHeartRateMonitorInterface';

export const useHeartRateMonitorMock = (): HeartRateMonitorInterface => {
  const [heartRate, setHeartRate] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const { logEvent } = useLogs();

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setHeartRate((prev) =>
          randomIntFromIntervalBasedOnPrev(130, 150, prev, 5)
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    requestPermission: () => {
      setIsConnected(true);
      logEvent('[mock] heart rate monitor connected');
    },
    disconnect: () => {
      setIsConnected(false);
      logEvent('[mock] heart rate monitor disconnected');
    },
    isConnected,
    status: isConnected ? 'connected' : 'not_connected',
    heartRate: isConnected ? heartRate : 0,
  };
};
