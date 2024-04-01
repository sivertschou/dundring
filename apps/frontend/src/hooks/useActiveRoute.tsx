import {} from 'dexie-react-hooks';
import { setRoute } from '../db';
import { Route, routeNameToWaypoint } from '../gps';
import { useWorkoutState } from './useWorkoutState';

export const useActiveRoute = () => {
  const { state } = useWorkoutState();

  return {
    activeRoute: {
      name: state.route,
      waypoints: routeNameToWaypoint(state.route),
    },
    setActiveRoute: (route: Route) => setRoute(route),
  };
};
