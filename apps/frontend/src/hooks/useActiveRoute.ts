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
    setActiveRoute: async (route: Route) => await setRoute(route),
  };
};
