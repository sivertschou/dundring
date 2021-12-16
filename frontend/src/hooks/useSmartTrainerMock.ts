import * as React from 'react';
import { useLogs } from '../context/LogContext';
import { randomIntFromIntervalBasedOnPrev } from '../utils';
import { SmartTrainer } from './useSmartTrainerInterface';

export const useSmartTrainerMock = (): SmartTrainer => {
  const [power, setPower] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const { add: addLog } = useLogs();

  React.useEffect(() => {
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
      addLog('[mock] smart trainer connected');
    },
    disconnect: () => {
      setIsConnected(false);
      addLog('[mock] smart trainer disconnected');
    },
    isConnected,
    power,
    setResistance: (resistance: number) => {
      console.log('MOCK: set resistance: ', resistance);
      addLog(`[mock] set resistance: ${resistance}W`);
    },
  };
};
