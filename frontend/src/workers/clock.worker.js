// let interval: NodeJS.Timeout | null = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  let dataInterval = null;
  let clockInterval = null;

  let lastDataTick = Date.now();
  let lastClockTick = Date.now();

  // eslint-disable-next-line no-restricted-globals
  self.onmessage = (msg) => {
    console.log('msg', msg);
    console.log('msg.data', msg.data);
    if (!msg) return;
    switch (msg.data) {
      case 'startDataTimer': {
        console.log('startDataTimer');
        if (dataInterval) clearInterval(dataInterval);
        lastDataTick = Date.now();

        dataInterval = setInterval(() => {
          // eslint-disable-next-line no-restricted-globals
          self.postMessage({
            type: 'dataTick',
            delta: Date.now() - lastDataTick,
          });
          lastDataTick = Date.now();
        }, 500);
        break;
      }
      case 'stopDataTimer': {
        console.log('stopDataTimer');
        clearInterval(dataInterval);
        dataInterval = null;
        break;
      }

      case 'startClockTimer': {
        console.log('startClockTimer');
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
        console.log('stopClockTimer');
        clearInterval(clockInterval);
        clockInterval = null;
        break;
      }
      default:
        console.log('not matching smh');
    }
  };
};
