import { Waypoint } from '../types';
import { lerp } from './general';

const zap: Waypoint[] = [
  { lat: 59.90347154, lon: 10.6590337, distance: 2400 },
  { lat: 59.88396124, lon: 10.64085992, distance: 600 },
  { lat: 59.88389387, lon: 10.65213867, distance: 2000 },
  { lat: 59.86610453, lon: 10.64629091, distance: 2400 },
  { lat: 59.88561483, lon: 10.6644647, distance: 600 },
  { lat: 59.8856822, lon: 10.65318595, distance: 2000 },
];

export const distanceToCoordinates = (totalDistance: number) => {
  const path = zap;
  // TODO: Memoize this
  const totalPathDistance = path.reduce(
    (sum, waypoint) => sum + waypoint.distance,
    0
  );
  const lapDistance = totalDistance % totalPathDistance;

  const { currentWaypoint, index, accDistance } = path.reduce(
    (
      {
        accDistance,
        currentWaypoint,
        index,
      }: {
        accDistance: number;
        currentWaypoint: Waypoint | null;
        index: number | null;
      },
      waypoint: Waypoint,
      i
    ): {
      accDistance: number;
      currentWaypoint: Waypoint | null;
      index: number | null;
    } => {
      if (currentWaypoint !== null)
        return { accDistance, currentWaypoint, index };

      if (accDistance + waypoint.distance > lapDistance) {
        return { accDistance, currentWaypoint: waypoint, index: i };
      }

      return {
        accDistance: accDistance + waypoint.distance,
        currentWaypoint,
        index,
      };
    },
    { accDistance: 0, currentWaypoint: null, index: null }
  );

  if (!currentWaypoint || index === null) return null;
  const distanceThisSegment = lapDistance - accDistance;
  const lat = lerp(
    currentWaypoint.lat,
    path[(index + 1) % path.length].lat,
    distanceThisSegment / currentWaypoint.distance
  );
  const lon = lerp(
    currentWaypoint.lon,
    path[(index + 1) % path.length].lon,
    distanceThisSegment / currentWaypoint.distance
  );
  return { lat, lon };
};
