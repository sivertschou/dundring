import { padLeadingZero } from '@dundring/utils';
import { DataPoint, Lap } from './types';

export const downloadTcx = (datapoints: DataPoint[]) => {
  const startTime = datapoints[0].timestamp;

  const output = toTcxString(datapoints);

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

export const toTcxString = (datapoints: DataPoint[]): string => {
  const lapMap = new Map<number, Lap>();

  let lastDatapoint: DataPoint | null = null;
  for (let i = 0; i < datapoints.length; i++) {
    const datapoint = datapoints[i];
    if (!datapoint.tracking) continue;

    const deltaDistance = lastDatapoint
      ? datapoint.accumulatedDistance - lastDatapoint.accumulatedDistance
      : datapoint.accumulatedDistance;

    const deltaDuration = lastDatapoint
      ? datapoint.timestamp.getTime() - lastDatapoint.timestamp.getTime()
      : 0;

    const deltaSumWatt = datapoint.power ?? 0;
    const deltaNormalizedDuration = datapoint.power === 0 ? 0 : deltaDuration;

    const lap = lapMap.get(datapoint.lapNumber);
    if (lap) {
      lapMap.set(datapoint.lapNumber, {
        dataPoints: [...lap.dataPoints, datapoint],
        distance: lap.distance + deltaDistance,
        duration: lap.duration + deltaDuration,
        sumWatt: lap.sumWatt + deltaSumWatt,
        normalizedDuration: lap.normalizedDuration + deltaNormalizedDuration,
      });
    } else {
      lapMap.set(datapoint.lapNumber, {
        dataPoints: [datapoint],
        distance: deltaDistance,
        duration: deltaDuration,
        sumWatt: deltaSumWatt,
        normalizedDuration: deltaNormalizedDuration,
      });
    }

    lastDatapoint = datapoint;
  }

  const laps = Array.from(lapMap.values());

  const startTime = datapoints[0].timestamp;
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
  const filteredDataPoints = lap.dataPoints.filter(
    (data) => data.heartRate || data.power
  );

  if (filteredDataPoints.length === 0) return '';
  return [
    `      <Lap StartTime="${filteredDataPoints[0].timestamp.toISOString()}">`,
    `        <DistanceMeters>${lap.distance}</DistanceMeters>`,
    `        <TotalTimeSeconds>${Math.round(lap.duration / 1000)}</TotalTimeSeconds>`,
    `        <Track>`,
    `${filteredDataPoints.reduce(
      (output, data) =>
        (output ? output + '\n' : output) +
        [
          `          <Trackpoint>`,
          `            <Time>${data.timestamp.toISOString()}</Time>`,
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
                `            <DistanceMeters>${data.accumulatedDistance}</DistanceMeters>`,
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
