// let interval: NodeJS.Timeout | null = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  let interval = null;
  // eslint-disable-next-line no-restricted-globals
  self.onmessage = (msg) => {
    console.log('msg', msg);
    if (msg && msg.data === 'startTimer') {
      if (interval) clearInterval(interval);
      // eslint-disable-next-line no-restricted-globals
      interval = setInterval(() => self.postMessage('tick'), 500);
    } else if (msg && msg.data === 'stopTimer' && interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  };
};
