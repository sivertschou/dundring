import * as React from 'react';
import { useLogs } from '../context/LogContext';
import { randomIntFromIntervalBasedOnPrev } from '../utils';
import { SmartTrainer } from './useSmartTrainerInterface';

export const useSmartTrainerMock = (): SmartTrainer => {
  const [power, setPower] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const { logEvent } = useLogs();
  React.useEffect(() => {
    console.log('redo the useEffect');
    const interval = setInterval(() => {
      if (isConnected) {
        setPower((prev) =>
          randomIntFromIntervalBasedOnPrev(100, 400, prev, 50)
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    requestPermission: () => {
      setIsConnected(true);
      logEvent('[mock] smart trainer connected');
    },
    disconnect: () => {
      setIsConnected(false);
      logEvent('[mock] smart trainer disconnected');
    },
    isConnected,
    power,
    setResistance: React.useCallback(
      (resistance: number) => {
        console.log('MOCK: set resistance: ', resistance);
        logEvent(`[mock] set resistance: ${resistance}W`);
      },
      [logEvent]
    ),
  };
};
