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

const legalUsernameCharacters = 'abcdefghifjklmnopqrstuvwxyz0123456789'.split(
  ''
);

export const getIllegalUsernameCharacters = (username: string): string[] => {
  return username.split('').filter((x) => !legalUsernameCharacters.includes(x));
};

export const removeDuplicateWords = (words: string[]) =>
  words.reduce(
    (entries, curr) =>
      entries.every((entry) => entry !== curr) ? [...entries, curr] : entries,
    [] as string[]
  );

export const mailIsValid = (mail: string) => /.+@.+\..+/.test(mail.trim());

export const padLeadingZero = (nr: number) => (nr < 10 ? '0' + nr : nr);

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
  Math.floor((ftpPercent / 100) * ftp);
