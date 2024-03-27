import { WorkoutDataPoint } from '../db';
import { Lap } from '../types';

export const rawToLaps = (datapoints: WorkoutDataPoint[]): Lap[] => {
  const lapNumbers = Array.from(
    datapoints.reduce((lapNumberSet, datapoint) => {
      lapNumberSet.add(datapoint.lapNumber);
      return lapNumberSet;
    }, new Set<number>())
  ).toSorted((a, b) => a - b);

  return lapNumbers.map((lapNumber) => ({
    dataPoints: datapoints.filter(
      (v) => v.lapNumber === lapNumber && v.tracking
    ),
    distance: 0 /*TODO: Fix this*/,
  }));
};
