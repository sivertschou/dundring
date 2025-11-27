// let interval: NodeJS.Timeout | null = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  let dataInterval = null;
  let clockInterval = null;

  let lastDataTick = Date.now();
  let clockStartTime = null;

  // eslint-disable-next-line no-restricted-globals
  self.onmessage = (msg) => {
    if (!msg) return;
    switch (msg.data) {
      case 'startDataTimer': {
        if (dataInterval) clearInterval(dataInterval);
        lastDataTick = Date.now();

        dataInterval = setInterval(() => {
          // eslint-disable-next-line no-restricted-globals
          self.postMessage({
            type: 'dataTick',
            delta: Date.now() - lastDataTick,
          });
          lastDataTick = Date.now();
        }, 1000);
        break;
      }
      case 'stopDataTimer': {
        clearInterval(dataInterval);
        dataInterval = null;
        break;
      }

      case 'startClockTimer': {
        if (clockInterval) clearInterval(clockInterval);
        clockStartTime = Date.now();

        clockInterval = setInterval(() => {
          // Calculate elapsed time based on wall-clock time
          const elapsed = Date.now() - clockStartTime;
          // eslint-disable-next-line no-restricted-globals
          self.postMessage({
            type: 'clockTick',
            elapsed: elapsed,
          });
        }, 200);
        break;
      }
      case 'stopClockTimer': {
        clearInterval(clockInterval);
        clockInterval = null;
        clockStartTime = null;
        break;
      }
      default:
      /* #justjsthings */
    }
  };
};
