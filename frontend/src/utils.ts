import { Workout } from './types';

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

export interface MinutesAndSeconds {
  minutes: number;
  seconds: number;
}

export const secondsToMinutesAndSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { minutes, seconds };
};

export const formatMinutesAndSecondsAsString = ({
  minutes,
  seconds,
}: MinutesAndSeconds) => {
  return `${padLeadingZero(minutes)}:${padLeadingZero(seconds)}`;
};

export const timestampToFormattedHHMMSS = (timestamp: Date) => {
  const hours = timestamp.getHours();
  const minutes = timestamp.getMinutes();
  const seconds = timestamp.getSeconds();
  return `${hours < 10 ? '0' + hours : hours}:${
    minutes < 10 ? '0' + minutes : minutes
  }:${seconds < 10 ? '0' + seconds : seconds}`;
};

export const getTotalWorkoutTime = (workout: Workout) =>
  workout.parts.reduce((sum, part) => sum + part.duration, 0);

export const padLeadingZero = (nr: number) => (nr < 10 ? '0' + nr : nr);

export const averageNonNull = (xs: (number | null | undefined)[]) => {
  const [num, den] = xs.reduce(
    (acc, cur) =>
      cur === null || cur === undefined ? acc : [acc[0] + cur, acc[1] + 1],
    [0, 0]
  );

  if (den === 0) return 0;
  return num / den;
};
