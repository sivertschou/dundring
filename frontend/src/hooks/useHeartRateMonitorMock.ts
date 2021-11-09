import * as React from "react";
import { randomIntFromInterval } from "../utils";
import { HeartRateMonitor } from "./useHeartRateMonitor";

export const useHeartRateMonitor = (): HeartRateMonitor => {
  const [heartRate, setHeartRate] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("This will run every second!");
      setHeartRate(randomIntFromInterval(0, 200));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    requestPermission: () => {},
    disconnect: () => {},
    isConnected: true,
    heartRate,
  };
};
