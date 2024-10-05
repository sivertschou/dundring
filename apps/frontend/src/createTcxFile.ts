import { padLeadingZero } from '@dundring/utils';
import { Lap } from './types';

export const downloadTcx = (laps: Lap[], distance: number) => {
  const startTime = laps[0].dataPoints[0].timeStamp;
  const output = toTcxString(laps, distance);

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

export const toTcxString = (laps: Lap[], distance: number): string => {
  const startTime = laps[0].dataPoints[0].timeStamp;
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<TrainingCenterDatabase`,
    `   xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd"`,
    `   xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1"`,
    `   xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2"`,
    `   xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2"`,
    `   xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"`,
    `   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `   xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1"> `,
    `  <Activities>`,
    `    <Activity Sport="Biking">`,
    `      <Id>${startTime.toISOString()}</Id>`,

    `      <DistanceMeters>${distance}</DistanceMeters>`,
    laps.map((lap) => lapToTCX(lap)).join('\n'),
    `    </Activity>`,
    `  </Activities>`,
    `  <Author xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Application_t">`,
    `    <Name>dundring.com</Name>`,
    `    <Build>`,
    `      <Version>`,
    `        <VersionMajor>1</VersionMajor>`,
    `        <VersionMinor>1</VersionMinor>`,
    `        <BuildMajor>1</BuildMajor>`,
    `        <BuildMinor>1</BuildMinor>`,
    `      </Version>`,
    `    </Build>`,
    `    <LangID>EN</LangID>`,
    `    <PartNumber>XXX-XXXXX-XX</PartNumber>`,
    `  </Author>`,
    `</TrainingCenterDatabase>`,
  ].join('\n');
};

const lapToTCX = (lap: Lap) => {
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

          data.position !== undefined
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
