import { Lap } from './types';
import { padLeadingZero } from './utils';

export const toTCX = (
  laps: Lap[],
  distance: number,
  includeGPSData: boolean
) => {
  const startTime = laps[0].dataPoints[0].timeStamp;
  const output = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"> `,
    `  <Activities>`,
    `    <Activity Sport="Biking">`,
    `      <Id>${startTime.toISOString()}</Id>`,

    includeGPSData ? `      <DistanceMeters>${distance}</DistanceMeters>` : '',
    laps.map((lap) => lapToTCX(lap, includeGPSData)).join('\n'),
    `    </Activity>`,
    `  </Activities>`,
    `  <Author xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Application_t">`,
    `    <Name>Dundring</Name>`,
    `    <Build>`,
    `      <Version>`,
    `        <VersionMajor>0</VersionMajor>`,
    `        <VersionMinor>0</VersionMinor>`,
    `      </Version>`,
    `    </Build>`,
    `    <LangID>EN</LangID>`,
    `    <PartNumber>XXX-XXXXX-XX</PartNumber>`,
    `  </Author>`,
    `</TrainingCenterDatabase>`,
  ].join('\n');

  const url = window.URL.createObjectURL(new Blob([output]));
  const link = document.createElement('a');

  const filename = `dundring_${formatDateForFilename(startTime)}`;

  link.href = url;
  link.setAttribute('download', `${filename}.tcx`);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode?.removeChild(link);
};

const lapToTCX = (lap: Lap, includeGPSData: boolean) => {
  const filtererdDataPoints = lap.dataPoints.filter(
    (data) => data.heartRate || data.power
  );

  if (filtererdDataPoints.length === 0) return '';
  return [
    `      <Lap StartTime="${filtererdDataPoints[0].timeStamp.toISOString()}">`,
    `        <Track>`,
    `${filtererdDataPoints.reduce(
      (output, data) =>
        (output ? output + '\n' : output) +
        [
          `          <Trackpoint>`,
          `            <Time>${data.timeStamp.toISOString()}</Time>`,
          data.heartRate !== undefined
            ? [
                `            <HeartRateBpm>`,
                `              <Value>${data.heartRate}</Value>`,
                `            </HeartRateBpm>`,
              ].join('\n')
            : '',

          includeGPSData && data.position !== undefined
            ? [
                `            <Position>`,
                `              <LatitudeDegrees>${data.position.lat}</LatitudeDegrees>`,
                `              <LongitudeDegrees>${data.position.lon}</LongitudeDegrees>`,
                `            </Position>`,
                `            <DistanceMeters>${data.position.distance}</DistanceMeters>`,
              ].join('\n')
            : '',
          data.cadence !== undefined
            ? `            <Cadence>${data.cadence}</Cadence>`
            : '',
          data.power !== undefined
            ? [
                `            <Extensions>`,
                `              <ns3:TPX>`,
                `                <ns3:Watts>${data.power}</ns3:Watts>`,
                `              </ns3:TPX>`,
                `            </Extensions>`,
              ].join('\n')
            : '',
          `            <SensorState>Present</SensorState>`,
          `          </Trackpoint>`,
        ]
          .filter((line) => line)
          .join('\n'),
      ''
    )}`,
    `        </Track>`,
    `      </Lap>`,
  ].join('\n');
};

const formatDateForFilename = (date: Date): string => {
  const yyyymmdd = date.toISOString().split('T')[0];
  const hhmm =
    padLeadingZero(date.getHours()) + '' + padLeadingZero(date.getMinutes());
  return yyyymmdd + 'T' + hhmm;
};
