import { Workout } from '../types';
import { padLeadingZero } from './general';

export interface MinutesAndSeconds {
  minutes: number;
  seconds: number;
}
export interface HoursMinutesAndSeconds {
  hours: number;
  minutes: number;
  seconds: number;
}

export const secondsToMinutesAndSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { minutes, seconds };
};

export const secondsToHoursMinutesAndSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { hours, minutes, seconds };
};

export const formatMinutesAndSecondsAsString = ({
  minutes,
  seconds,
}: MinutesAndSeconds) => {
  return `${padLeadingZero(minutes)}:${padLeadingZero(seconds)}`;
};

export const formatHoursMinutesAndSecondsAsString = ({
  hours,
  minutes,
  seconds,
}: HoursMinutesAndSeconds) => {
  return `${hours ? hours + ':' : ''}${formatMinutesAndSecondsAsString({
    minutes,
    seconds,
  })}`;
};

export const secondsToMinutesAndSecondsString = (seconds: number) =>
  formatMinutesAndSecondsAsString(secondsToMinutesAndSeconds(seconds));

export const secondsToHoursMinutesAndSecondsString = (seconds: number) =>
  formatHoursMinutesAndSecondsAsString(
    secondsToHoursMinutesAndSeconds(seconds)
  );

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
