import * as React from "react";
import { randomIntFromInterval } from "../utils";

export const useSmartTrainer = () => {
  const [power, setPower] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('This will run every second!');
      setPower(randomIntFromInterval(100, 400))
    }, 1000);
    return () => clearInterval(interval);
  }, []);



  return {
    requestSmartTrainerPermission: () => { },
    disconnect: () => { },
    isConnected: true,
    power,
    setResistance: (x: number) => { }
  }
}

