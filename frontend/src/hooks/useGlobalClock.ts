import * as React from 'react';

type Callback = (timeSinceLast: number) => void;

interface ClockState {
  callback: Callback;
  wakeLock: WakeLockSentinel;
}

export const useGlobalClock = (callback: Callback) => {
  const [callbacks, setCallbacks] = React.useState<ClockState | null>(null);
  const [lastCallbackTime, setLastCallbackTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (callbacks) {
        const now = new Date();
        const diff = now.getTime() - lastCallbackTime.getTime();
        callbacks?.callback(diff);
        setLastCallbackTime(now);
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [callbacks, lastCallbackTime]);

  return {
    stop: () => {
      callbacks?.wakeLock?.release();
      setCallbacks(null);
    },
    start: () => {
      navigator.wakeLock
        .request('screen')
        .then((wakeLock) => setCallbacks({ wakeLock, callback }));
      setLastCallbackTime(new Date());
    },
    running: callbacks != null,
  };
};
