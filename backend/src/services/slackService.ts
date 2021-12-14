export const sendSivertSlackMessage = (message: string) => {
  const url = `https://hooks.slack.com/services/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`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: message }),
  })
    .then((ret) => console.log('success'))
    .catch((e) => console.log('error:', e));
};
