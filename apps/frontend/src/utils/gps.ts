import {Waypoint} from '../types';
import {lerp} from './general';

export const distanceToCoordinates = (
	path: Waypoint[],
	totalDistance: number,
) => {
	// TODO: Memoize this
	const totalPathDistance = path.reduce(
		(sum, waypoint) => sum + waypoint.distance,
		0,
	);
	const lapDistance = totalDistance % totalPathDistance;

	const {currentWaypoint, index, accDistance} = path.reduce(
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
			i,
		): {
			accDistance: number;
			currentWaypoint: Waypoint | null;
			index: number | null;
		} => {
			if (currentWaypoint !== null)
				return {accDistance, currentWaypoint, index};

			if (accDistance + waypoint.distance > lapDistance) {
				return {accDistance, currentWaypoint: waypoint, index: i};
			}

			return {
				accDistance: accDistance + waypoint.distance,
				currentWaypoint,
				index,
			};
		},
		{accDistance: 0, currentWaypoint: null, index: null},
	);

	if (!currentWaypoint || index === null) return null;
	const distanceThisSegment = lapDistance - accDistance;
	const lat = lerp(
		currentWaypoint.lat,
		path[(index + 1) % path.length].lat,
		distanceThisSegment / currentWaypoint.distance,
	);
	const lon = lerp(
		currentWaypoint.lon,
		path[(index + 1) % path.length].lon,
		distanceThisSegment / currentWaypoint.distance,
	);
	return {lat, lon};
};
