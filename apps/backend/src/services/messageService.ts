import { Message } from '@dundring/types';
require('dotenv').config();
const fs = require('fs');

const messagePath = `${process.env.DATA_PATH}/messages.json`;

export const getMessages = (): Message[] => {
  if (fs.existsSync(messagePath)) {
    const rawdata = fs.readFileSync(messagePath);
    const parsedData = JSON.parse(rawdata);

    return [...parsedData];
  }

  return [];
};
