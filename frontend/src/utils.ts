import { DataPoint, Workout } from "./types";

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

const legalUsernameCharacters = "abcdefghifjklmnopqrstuvwxyz0123456789".split(
  ""
);

export const getIllegalUsernameCharacters = (username: string): string[] => {
  return username.split("").filter((x) => !legalUsernameCharacters.includes(x));
};

export const removeDuplicateWords = (words: string[]) =>
  words.reduce(
    (entries, curr) =>
      entries.every((entry) => entry !== curr) ? [...entries, curr] : entries,
    [] as string[]
  );

export const mailIsValid = (mail: string) => /.+@.+\..+/.test(mail.trim());

export const toGPX = (dataPoints: DataPoint[]) => {
  const filtererdDataPoints = dataPoints.filter((d) => d.heartRate || d.power);
  const startTime = filtererdDataPoints[0].timeStamp;
  const endTime = filtererdDataPoints[filtererdDataPoints.length - 1].timeStamp;

  const duration = (endTime.getTime() - startTime.getTime()) / 1000;

  const output = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<gpx creator="dundring.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">`,
    `<metadata><time>${startTime.toISOString()}</time></metadata>`,
    `<trk>`,
    `<name>${"Dundring"}</name>`,
    `<type>17</type>`, // TODO: Look up types
    `<trkseg>`,
    `${filtererdDataPoints.reduce(
      (output, d) =>
        output +
        [
          `<trkpt>`,
          `  <time>${d.timeStamp.toISOString()}</time>`,
          `  <extensions>`,
          d.power !== undefined ? `    <power>${d.power}</power>` : "",
          `    <gpxtpx:TrackPointExtension>`,
          d.heartRate !== undefined
            ? `      <gpxtpx:hr>${d.heartRate}</gpxtpx:hr>`
            : "",
          `    </gpxtpx:TrackPointExtension>`,
          `  </extensions>`,
          `</trkpt>`,
        ]
          .filter((line) => line)
          .join("\n"),
      ""
    )}`,
    `</trkseg>`,
    `</trk>`,
    `</gpx>`,
  ].join("\n");

  const url = window.URL.createObjectURL(new Blob([output]));
  const link = document.createElement("a");

  const filename = `dundring_${formatDateForFilename(startTime)}`;

  link.href = url;
  link.setAttribute("download", `${filename}.gpx`);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode?.removeChild(link);
};

export interface HoursMinutesAndSeconds {
  hours: number;
  minutes: number;
  seconds: number;
}
export const secondsToHoursMinutesAndSeconds = (totalSeconds: number) => {
  const hours = Math.floor((totalSeconds / 60 / 60) % 24);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { hours, minutes, seconds };
};
export const formatHoursMinutesAndSecondsAsString = ({
  hours,
  minutes,
  seconds,
}: HoursMinutesAndSeconds) => {
  return `${hours > 0 ? hours + ":" : ""}${padLeadingZero(
    minutes
  )}:${padLeadingZero(seconds)}`;
};

export const getTotalWorkoutTime = (workout: Workout) =>
  workout.parts.reduce((sum, part) => sum + part.duration, 0);

const padLeadingZero = (nr: number) => (nr < 10 ? "0" + nr : nr);

const formatDateForFilename = (date: Date): string => {
  const yyyymmdd = date.toISOString().split("T")[0];
  const hhmm =
    padLeadingZero(date.getHours()) + "" + padLeadingZero(date.getMinutes());
  return yyyymmdd + "T" + hhmm;
};
