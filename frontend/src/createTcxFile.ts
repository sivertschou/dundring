import { Lap } from './types';

export const lapToTCX = (lap: Lap) => {
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
