import { Lap } from './types';
import { padLeadingZero } from './utils';

export const toTCX = (laps: Lap[]) => {
  const startTime = laps[0].dataPoints[0].timeStamp;
  const output = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"> `,
    `  <Activities>`,
    `    <Activity Sport="Biking">`,
    `      <Id>${startTime.toISOString()}</Id>`,
    laps.map((lap) => lapToTCX(lap)).join('\n'),
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

const lapToTCX = (lap: Lap) => {
  const filtererdDataPoints = lap.dataPoints.filter(
    (d) => d.heartRate || d.power
  );
  return [
    `      <Lap StartTime="${filtererdDataPoints[0].timeStamp.toISOString()}">`,
    `        <Track>`,
    `${filtererdDataPoints.reduce(
      (output, d) =>
        (output ? output + '\n' : output) +
        [
          `          <Trackpoint>`,
          `            <Time>${d.timeStamp.toISOString()}</Time>`,
          d.heartRate !== undefined
            ? [
                `            <HeartRateBpm>`,
                `              <Value>${d.heartRate}</Value>`,
                `            </HeartRateBpm>`,
              ].join('\n')
            : '',
          d.power !== undefined
            ? [
                `            <Extensions>`,
                `              <ns3:TPX>`,
                `                <ns3:Watts>${d.power}</ns3:Watts>`,
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
