import * as React from "react";
import { randomIntFromIntervalBasedOnPrev } from "../utils";
import { HeartRateMonitor } from "./useHeartRateMonitorInterface";

export const useHeartRateMonitorMock = (): HeartRateMonitor => {
  const [heartRate, setHeartRate] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
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
    requestPermission: () => setIsConnected(true),
    disconnect: () => setIsConnected(false),
    isConnected,
    heartRate,
  };
};
