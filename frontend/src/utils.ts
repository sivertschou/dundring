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

export const toTCX = (dataPoints: DataPoint[]) => {
  const filtererdDataPoints = dataPoints.filter((d) => d.heartRate || d.power);
  const startTime = filtererdDataPoints[0].timeStamp;
  const endTime = filtererdDataPoints[filtererdDataPoints.length - 1].timeStamp;

  const duration = (endTime.getTime() - startTime.getTime()) / 1000;

  const output = `
<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Biking">
      <Id>${startTime.toISOString()}</Id>
      <Lap StartTime="${startTime.toISOString()}">
        <TotalTimeSeconds>${duration}</TotalTimeSeconds>
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
        ${filtererdDataPoints.reduce(
          (output, d) =>
            output +
            `<Trackpoint>
              <Time>${d.timeStamp.toISOString()}</Time>
              <HeartRateBpm>
                <Value>${d.heartRate}</Value>
              </HeartRateBpm>
              <Extensions>
                <ns3:TPX>
                    <ns3:Watts>${d.power}</ns3:Watts>
                </ns3:TPX>
                </Extensions>
              <SensorState>Present</SensorState>
            </Trackpoint>
            `,
          ""
        )}
          </Track>
        </Lap>
    </Activity>
  </Activities>
  <Author xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Application_t">
    <Name>Dundring</Name>
    <Build>
      <Version>
        <VersionMajor>0</VersionMajor>
        <VersionMinor>0</VersionMinor>
      </Version>
    </Build>
    <LangID>EN</LangID>
    <PartNumber>XXX-XXXXX-XX</PartNumber>
  </Author>
</TrainingCenterDatabase>
 `;

  console.log("output:", output);

  const url = window.URL.createObjectURL(new Blob([output]));
  const link = document.createElement("a");

  const filename = `dundring_${formatDateForFilename(startTime)}`;

  link.href = url;
  link.setAttribute("download", `${filename}.tcx`);

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
  return `${hours > 0 ? hours + ":" : ""}${padLeadingZero(minutes)}:${padLeadingZero(seconds)}`;
};

export const getTotalWorkoutTime = (workout: Workout) =>
  workout.parts.reduce((sum, part) => sum + part.duration, 0);

const padLeadingZero = (nr: number) =>
  nr < 10 ? "0" + nr : nr

const formatDateForFilename = (date: Date): string => {
  const yyyymmdd = date.toISOString().split("T")[0]
  const hhmm = padLeadingZero(date.getHours()) + "" + padLeadingZero(date.getMinutes())
  return yyyymmdd + "T" + hhmm
}