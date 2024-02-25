import * as React from 'react';
import { useData } from '../../context/DataContext';
import { Waypoint } from '../../types';
import { powerColor } from '../../colors';
import { useColorModeValue } from '@chakra-ui/react';

export const Map = () => {
  const { data: laps, activeRoute } = useData();
  const dotStrokeColor = useColorModeValue('black', 'white');
  const rawData = laps.flatMap((x) => x.dataPoints);

  const multiplier = 100;

  const dataPoints = rawData
    .map((dataPoint) => dataPoint.position)
    .filter((value) => value !== undefined) as Waypoint[];

  const coordinates = waypointsToSvgPoints(dataPoints, multiplier);
  const routeCoordinates = waypointsToSvgPoints(
    activeRoute.waypoints,
    multiplier
  );

  const { minX, maxX, minY, maxY } = routeCoordinates.reduce(
    (prev, dataPoint) => {
      return {
        minX: Math.min(prev.minX, dataPoint.x),
        maxX: Math.max(prev.maxX, dataPoint.x),
        minY: Math.min(prev.minY, dataPoint.y),
        maxY: Math.max(prev.maxY, dataPoint.y),
      };
    },
    {
      minX: 180 * multiplier,
      maxX: -180 * multiplier,
      minY: 90 * multiplier,
      maxY: -90 * multiplier,
    }
  );

  const padding = 0.1;

  const viewBox = `${minX - padding} ${minY - padding} ${
    maxX - minX + padding * 2
  } ${maxY - minY + padding * 2}`;

  const lastPoint =
    coordinates.length !== 0 ? coordinates[coordinates.length - 1] : null;

  return (
    <svg viewBox={viewBox}>
      <path
        fill="none"
        stroke="gray"
        strokeWidth="0.01"
        strokeLinejoin="round"
        strokeLinecap="round"
        d={`M ${routeCoordinates
          .map((dataPoint) => `${dataPoint.x} ${dataPoint.y}`)
          .join(' ')}Z`}
      />
      <path
        fill="none"
        stroke={powerColor}
        strokeWidth=".05"
        strokeLinejoin="round"
        strokeLinecap="round"
        d={`M ${coordinates
          .map((dataPoint) => `${dataPoint.x} ${dataPoint.y}`)
          .join(' ')}`}
      />
      {lastPoint ? (
        <g>
          <circle
            r=".06"
            cx={lastPoint.x}
            cy={lastPoint.y}
            fill="white"
            stroke={dotStrokeColor}
            strokeWidth="0.01px"
          />
        </g>
      ) : null}
    </svg>
  );
};

const waypointsToSvgPoints = (waypoints: Waypoint[], multiplier = 1) =>
  waypoints.map((waypoint) => ({
    x: waypoint.lon * multiplier,
    /* Negated to align Y axis */
    y: -waypoint.lat * multiplier,
  }));
