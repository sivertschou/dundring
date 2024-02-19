import { Editable } from '../types';

export const lerp = (from: number, to: number, amount: number) => {
  return from + (to - from) * Math.max(Math.min(1, amount), 0);
};

export const randomIntFromIntervalBasedOnPrev = (
  min: number,
  max: number,
  prev: number,
  maxDiff: number
): number => {
  return Math.max(
    Math.min(max, prev + Math.floor(Math.random() * maxDiff - maxDiff / 2)),
    min
  );
};

export const parseInputAsInt = (input: string) => {
  const parsed = parseInt(input);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
};

export const parseWattInput = (input: string) => {
  const parsed = parseFloat(input);

  if (isNaN(parsed)) return null;

  return Math.floor(parsed);
};

export const parseFtpPercentInput = (input: string) => {
  const parsed = parseFloat(input);

  if (isNaN(parsed)) return null;

  return Math.floor(parsed * 10) / 10;
};

const digits = '0123456789'.split('');
export const stringIsValidUnsignedInt = (input: string) =>
  input.split('').every((char) => digits.includes(char));

export const ftpPercentFromWatt = (watt: number, ftp: number) =>
  Math.floor(1000 * (watt / ftp)) / 10;

export const wattFromFtpPercent = (ftpPercent: number, ftp: number) =>
  Math.floor((ftpPercent * ftp) / 100);

export const editable = <T>(data: T): Editable<T> => ({ touched: false, data });
export const touched = <T>(data: T): Editable<T> => ({ touched: true, data });
