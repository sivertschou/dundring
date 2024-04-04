// let interval: NodeJS.Timeout | null = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  let dataInterval = null;
  let clockInterval = null;

  let lastDataTick = Date.now();
  let lastClockTick = Date.now();

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
        lastClockTick = Date.now();

        clockInterval = setInterval(() => {
          // eslint-disable-next-line no-restricted-globals
          self.postMessage({
            type: 'clockTick',
            delta: Date.now() - lastClockTick,
          });
          lastClockTick = Date.now();
        }, 200);
        break;
      }
      case 'stopClockTimer': {
        clearInterval(clockInterval);
        clockInterval = null;
        break;
      }
      default:
      /* #justjsthings */
    }
  };
};
