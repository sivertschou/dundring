import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const transports = [];

if (isProduction) {
  if (process.env.LOGTAIL_TOKEN) {
    const logtail = new Logtail(process.env.LOGTAIL_TOKEN, {
      endpoint: 'https://s1307406.eu-nbg-2.betterstackdata.com',
    });
    transports.push(new LogtailTransport(logtail));
  }

  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

if (!isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : '';
          return `${timestamp} [${level}]: ${message} ${metaString}`;
        })
      ),
    })
  );
}

export const logger = winston.createLogger({
  level: 'debug',
  transports,
});
