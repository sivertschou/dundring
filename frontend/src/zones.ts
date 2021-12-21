import { WorkoutPart } from '../../common/types/workoutTypes';
import {
  formatMinutesAndSecondsAsString,
  secondsToMinutesAndSeconds,
} from './utils';

export type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7';

const zones: Readonly<Zone[]> = [
  'Z1',
  'Z2',
  'Z3',
  'Z4',
  'Z5',
  'Z6',
  'Z7',
] as const;

type Range = { lower: number; upper: number | null };

const getRange = (zone: Zone): { lower: number; upper: number | null } => {
  switch (zone) {
    case 'Z1':
      return { lower: 0, upper: 55 };
    case 'Z2':
      return { lower: 55, upper: 75 };
    case 'Z3':
      return { lower: 75, upper: 90 };
    case 'Z4':
      return { lower: 90, upper: 105 };
    case 'Z5':
      return { lower: 105, upper: 120 };
    case 'Z6':
      return { lower: 120, upper: 150 };
    case 'Z7':
      return { lower: 150, upper: null };
  }
};

export const findZone = (pct: number): Zone => {
  if (pct <= getRange('Z1').upper!!) return 'Z1';
  if (pct <= getRange('Z2').upper!!) return 'Z2';
  if (pct <= getRange('Z3').upper!!) return 'Z3';
  if (pct <= getRange('Z4').upper!!) return 'Z4';
  if (pct <= getRange('Z5').upper!!) return 'Z5';
  if (pct <= getRange('Z6').upper!!) return 'Z6';
  return 'Z7';
};

const scaleRangeToFtp = ({ lower, upper }: Range, ftp: number) => ({
  lower: 1 + Math.floor((lower * ftp) / 100),
  upper: upper && Math.floor((upper * ftp) / 100),
});

export const createZoneTableInfo = (
  workoutParts: WorkoutPart[],
  totalDuration: number,
  ftp: number
) => {
  const zoneMap = new Map<Zone, number>(zones.map((z) => [z as Zone, 0]));
  workoutParts.forEach((p) => {
    const zone = findZone(p.targetPower);
    const curDuration = zoneMap.get(zone) || 0;
    zoneMap.set(zone, curDuration + p.duration);
  });

  const sortedPairs = Array.from(zoneMap).sort((zoneSum1, zoneSum2) =>
    zoneSum1[0].localeCompare(zoneSum2[0])
  );

  const zonesWithDurations = sortedPairs.map(([zone, duration]) => ({
    zone,
    duration,
    pctDuration: Math.round((100 * duration) / totalDuration),
  }));

  return zonesWithDurations.map((zoneWithDurations) => ({
    ...zoneWithDurations,
    duration: formatMinutesAndSecondsAsString(
      secondsToMinutesAndSeconds(zoneWithDurations.duration)
    ),
    range: scaleRangeToFtp(getRange(zoneWithDurations.zone), ftp),
    rangePct: getRange(zoneWithDurations.zone),
  }));
};
