import * as React from "react";

interface Callback {
  name: string;
  callback: (timeSinceLast: number) => any;
}

export const useGlobalClock = () => {
  const [running, setRunning] = React.useState(false);
  const [callbacks, setCallbacks] = React.useState([] as Callback[]);
  const [lastCallbackTime, setLastCallbackTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        const now = new Date();
        const diff = now.getTime() - lastCallbackTime.getTime();
        callbacks.forEach((c) => {
          c.callback(diff);
        });
        setLastCallbackTime(now);
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [callbacks, lastCallbackTime, running]);

  const addCallback = (callback: Callback) => {
    setCallbacks((callbacks) => [...callbacks, callback]);
  };
  const removeCallback = (callbackName: string) => {
    setCallbacks((callbacks) =>
      callbacks.filter((callback) => callback.name !== callbackName)
    );
  };

  return {
    stop: () => {
      setRunning(false);
    },
    start: () => {
      setLastCallbackTime(new Date());
      setRunning(true);
    },
    addCallback,
    removeCallback,
    running,
  };
};
