import { Waypoint } from '../types';
import { lerp } from './general';

export const distanceToCoordinates = (
  path: Waypoint[],
  totalDistance: number
) => {
  // TODO: Memoize this
  const totalRouteDistance = path.reduce(
    (sum, waypoint) => sum + waypoint.distance,
    0
  );
  const lapDistance = totalDistance % totalRouteDistance;

  let distance = 0;
  let lastCheckpoint = path[0];
  let nextCheckpoint = path[1 % path.length];
  for (let i = 0; i < path.length; i++) {
    if (distance + path[i].distance > lapDistance) {
      lastCheckpoint = path[i];
      nextCheckpoint = path[(i + 1) % path.length];
      break;
    }

    distance += path[i].distance;
  }

  const lat = lerp(
    lastCheckpoint.lat,
    nextCheckpoint.lat,
    (lapDistance - distance) / lastCheckpoint.distance
  );
  const lon = lerp(
    lastCheckpoint.lon,
    nextCheckpoint.lon,
    (lapDistance - distance) / lastCheckpoint.distance
  );
  return { lat, lon };
};
