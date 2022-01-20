import * as React from 'react';
import { useLogs } from '../context/LogContext';
import { randomIntFromIntervalBasedOnPrev } from '../utils';
import { SmartTrainer } from './useSmartTrainerInterface';

export const useSmartTrainerMock = (): SmartTrainer => {
  const [power, setPower] = React.useState(0);
  const [cadence, setCadence] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const [currentResistance, setCurrentResistance] = React.useState(0);
  const { logEvent } = useLogs();
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setPower((prev) =>
          randomIntFromIntervalBasedOnPrev(100, 400, prev, 50)
        );
        setCadence((prev) =>
          randomIntFromIntervalBasedOnPrev(50, 100, prev, 10)
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
    cadence: cadence,
    speed: 0,
    currentResistance,
    setResistance: React.useCallback(
      (resistance: number) => {
        console.log('MOCK: set resistance: ', resistance);
        logEvent(`[mock] set resistance: ${resistance}W`);
        setCurrentResistance(resistance);
      },
      [logEvent]
    ),
  };
};
