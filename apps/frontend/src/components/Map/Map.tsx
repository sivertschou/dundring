import { AspectRatio, Stack } from '@chakra-ui/layout';
import * as React from 'react';
import { dRaw, useData, zap } from '../../context/DataContext';
import { Waypoint } from '../../types';
import { powerColor } from '../../colors';
import { Box } from '@chakra-ui/react';

interface Props {}

const waypointsToSvgPoints = (waypoints: Waypoint[], multiplier = 1) =>
  waypoints.map((waypoint) => ({
    x: waypoint.lon * multiplier,
    y: -waypoint.lat * multiplier,
  }));

export const Map = ({}: Props) => {
  const { data: laps, activeRoute } = useData();
  const rawData = laps.flatMap((x) => x.dataPoints);

  const multiplier = 100;

  const dataPoints = rawData
    .map((dataPoint) => dataPoint.position)
    .filter((value) => value !== undefined) as Waypoint[];

  const coordinates = waypointsToSvgPoints(dataPoints, multiplier);
  const routeCoordinates = waypointsToSvgPoints(activeRoute, multiplier);

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
          .map(
            (dataPoint, i) =>
              `${i !== 0 ? '' : ''}${dataPoint.x} ${dataPoint.y}`
          )
          .join(' ')}Z`}
      />
      <path
        fill="none"
        stroke={powerColor}
        strokeWidth=".05"
        strokeLinejoin="round"
        strokeLinecap="round"
        d={`M ${coordinates
          .map(
            (dataPoint, i) =>
              `${i !== 0 ? '' : ''}${dataPoint.x} ${dataPoint.y}`
          )
          .join(' ')}`}
      />
      {lastPoint ? (
        <circle r=".05" cx={lastPoint.x} cy={lastPoint.y} fill="white" />
      ) : null}
    </svg>
  );
};
