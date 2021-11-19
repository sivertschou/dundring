import * as React from "react";

interface Callback {
  callback: (timeSinceLast: number) => any;
}

export const useGlobalClock = () => {
  const [running, setRunning] = React.useState(false);
  const [callbacks, setCallbacks] = React.useState(null as Callback | null);
  const [lastCallbackTime, setLastCallbackTime] = React.useState(new Date());

  const [wakeLock, setWakeLock] = React.useState<WakeLockSentinel | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        const now = new Date();
        const diff = now.getTime() - lastCallbackTime.getTime();
        callbacks?.callback(diff);
        setLastCallbackTime(now);
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [callbacks, lastCallbackTime, running]);


  return {
    stop: () => {
      wakeLock?.release()
      setWakeLock(null);
      setRunning(false);
    },
    start: () => {
      navigator.wakeLock
        .request('screen')
        .then(setWakeLock)
      setLastCallbackTime(new Date());
      setRunning(true);
    },
    addCallback: (callback: Callback) => setCallbacks(callbacks),
    removeCallback: () => setCallbacks(null),
    running,
  };
};
