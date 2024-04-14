import { padLeadingZero } from './string';

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const seconds = (seconds: number) => seconds * SECOND;
export const minutes = (minutes: number) => minutes * MINUTE;
export const hours = (hours: number) => hours * HOUR;
export const days = (days: number) => days * DAY;

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

export const millisToHoursMinutesAndSeconds = (millis: number) => {
  const hours = Math.floor(millis / HOUR);
  const minutes = Math.floor((millis % HOUR) / MINUTE);
  const seconds = Math.floor((millis % MINUTE) / SECOND);
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

export const relativeHours = (deltaMillis: number) => {
  const { hours } = millisToHoursMinutesAndSeconds(deltaMillis);

  const addPrefixOrPostfix = (description: string) => {
    if (deltaMillis < 0) return `in ${description}`;
    return `${description} ago`;
  };

  switch (hours) {
    case 0:
      return addPrefixOrPostfix('less than an hour');
    case 1:
      return addPrefixOrPostfix('1 hour');
    default:
      return addPrefixOrPostfix(`${hours} hours`);
  }
};
