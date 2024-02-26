import { Waypoint } from './types';

type Point = { lon: number; lat: number };
export type Route = 'zap' | 'D';

const haversine = (pointA: Point, pointB: Point) => {
  const R = 6371.0; // Earth radius in kilometers

  // Differences between latitudes and longitudes
  const dLat = toRadians(pointB.lat) - toRadians(pointA.lat);
  const dLon = toRadians(pointB.lon) - toRadians(pointA.lon);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pointA.lat)) *
      Math.cos(toRadians(pointB.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

export const routeNameToWaypoint = (routeName: Route) => {
  switch (routeName) {
    case 'D':
      return dWaypoints;
    case 'zap':
      return zapWaypoints;
  }
};

export const stringToRouteName = (route: string): Route => {
  switch (route) {
    case 'D':
      return 'D';
    case 'zap':
    default:
      return 'zap';
  }
};

export const zapWaypoints: Waypoint[] = [
  { lon: 10.6590337, lat: 59.90347154, distance: 2400 },
  { lon: 10.64085992, lat: 59.88396124, distance: 600 },
  { lon: 10.65213867, lat: 59.88389387, distance: 2000 },
  { lon: 10.64629091, lat: 59.86610453, distance: 2400 },
  { lon: 10.6644647, lat: 59.88561483, distance: 600 },
  { lon: 10.65318595, lat: 59.8856822, distance: 2000 },
];

export const dStartPoint = { lon: 10.156904, lat: 58.218246 };
export const dScale = 16652.679;
export const dWaypoints: Waypoint[] =
  'M52.441,6.944L6.944,99.757L65.483,98.602L41.535,266.697L194.534,96.048L145.952,97.005L162.132,58.67L233.957,60.637L286.632,70.238L321.687,84.921L343.785,103.523L353.971,123.439L355.695,136.82L352.395,155.383L340.667,173.874L316.104,191.846L279.854,205.146L242.113,211.914L199.121,214.592L115.318,214.647L68.661,266.697L233.957,265.55L292.804,259.597L347.319,247.755L390.832,231.15L426.372,208.159L447.79,183.522L458.152,159.53L460.969,137.141L456.411,108.765L443.483,84.096L421.917,61.994L386.125,40.317L340.331,23.913L300.784,15.296L263.649,10.335L209.737,7.141L52.441,6.944Z'
    .split(/M|L|Z/)
    .filter((v) => !!v)
    .map((pair) => {
      const [x, y] = pair.split(',');
      return { x: parseFloat(x) / dScale, y: parseFloat(y) / dScale };
    })
    .map(({ x, y }) => ({
      lon: x + dStartPoint.lon,
      /* Negated to align Y axis */
      lat: -y + dStartPoint.lat,
    }))
    .map((point, index, arr) => ({
      ...point,
      distance: haversine(point, arr[(index + 1) % arr.length]) * 1000,
    }));

export const toWebMercatorCoordinates = (waypoint: Waypoint) => {
  const zoom = 8;
  return {
    x:
      (1 / (2 * Math.PI)) *
      Math.pow(2, zoom) *
      (Math.PI + toRadians(waypoint.lon)),
    y:
      (1 / (2 * Math.PI)) *
      Math.pow(2, zoom) *
      (Math.PI - Math.log(Math.tan(Math.PI / 4 + toRadians(waypoint.lat) / 2))),
  };
};
