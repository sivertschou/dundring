import * as React from 'react';
import { ActiveWorkout, Workout } from '../types';
import { wattFromFtpPercent } from '../utils/general';
import { useSmartTrainer } from './SmartTrainerContext';
import { useUser } from './UserContext';

export const ActiveWorkoutContext = React.createContext<{
  activeWorkout: ActiveWorkout;
  setActiveWorkout: (workout: Workout) => void;
  increaseElapsedTime: (millis: number, addLap: () => void) => void;
  start: () => void;
  pause: () => void;
  activeFtp: number;
  setActiveFtp: (ftp: number) => void;
  changeActivePart: (partNumber: number, addLap: () => void) => void;
  syncResistance: () => void;
  syncResistanceIfActive: () => void;
} | null>(null);

interface IncreasePartElapsedTimeAction {
  type: 'INCREASE_PART_ELAPSED_TIME';
  millis: number;
  setResistance: (resistance: number) => void;
  activeFtp: number;
  addLap: () => void;
}

interface SetWorkoutAction {
  type: 'SET_WORKOUT';
  workout: Workout;
}

interface StartAction {
  type: 'START';
  setResistance: (resistance: number) => void;
  activeFtp: number;
}
interface PauseAction {
  type: 'PAUSE';
  setResistance: (resistance: number) => void;
  activeFtp: number;
}

interface ChangeActivePartAction {
  type: 'CHANGE_ACTIVE_PART';
  setResistance: (resistance: number) => void;
  activeFtp: number;
  addLap: () => void;
  partNumber: number;
}

type ActiveWorkoutAction =
  | IncreasePartElapsedTimeAction
  | SetWorkoutAction
  | StartAction
  | PauseAction
  | ChangeActivePartAction;
export const ActiveWorkoutContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const [activeFtp, setActiveFtp] = React.useState(
    (user.loggedIn && user.ftp) || 250
  );
  React.useEffect(() => {
    // TODO: This might get triggered when other updates are made to user.
    if (user.loggedIn && user.ftp) {
      setActiveFtp(user.ftp);
    }
  }, [user]);

  const activeWorkoutReducer = (
    activeWorkout: ActiveWorkout,
    action: ActiveWorkoutAction
  ): ActiveWorkout => {
    switch (action.type) {
      case 'SET_WORKOUT':
        return {
          workout: action.workout,
          activePart: 0,
          status: 'not_started',
          partElapsedTime: 0,
        };
      case 'INCREASE_PART_ELAPSED_TIME':
        if (activeWorkout.status !== 'active') {
          return activeWorkout;
        }

        const newElapsed = action.millis + activeWorkout.partElapsedTime;

        if (!activeWorkout.workout) {
          return { ...activeWorkout, partElapsedTime: newElapsed };
        }

        const elapsedSeconds = Math.floor(newElapsed / 1000);
        const prevActivePart = activeWorkout.activePart;
        const prevWorkoutParts = activeWorkout.workout.parts;
        const currentPartDuration = prevWorkoutParts[prevActivePart].duration;
        if (currentPartDuration < elapsedSeconds) {
          // Done with current part
          if (prevActivePart === prevWorkoutParts.length - 1) {
            // Done with every part
            const nextState: ActiveWorkout = {
              ...activeWorkout,
              partElapsedTime: 0,
              activePart: 0,
              status: 'finished',
            };
            action.addLap();
            return nextState;
          }
          // Only done with current part, other parts unfinished
          const nextState: ActiveWorkout = {
            ...activeWorkout,
            partElapsedTime: newElapsed - currentPartDuration * 1000,
            activePart: activeWorkout.activePart + 1,
          };
          action.addLap();
          return nextState;
        }
        // Current part is not finished
        return { ...activeWorkout, partElapsedTime: newElapsed };
      case 'START': {
        const nextState: ActiveWorkout = { ...activeWorkout, status: 'active' };
        return nextState;
      }
      case 'PAUSE': {
        const nextState: ActiveWorkout = { ...activeWorkout, status: 'paused' };
        return nextState;
      }
      case 'CHANGE_ACTIVE_PART': {
        if (!activeWorkout.workout) return activeWorkout;

        action.addLap();

        if (action.partNumber >= activeWorkout.workout.parts.length) {
          return {
            ...activeWorkout,
            partElapsedTime: 0,
            status: 'finished',
          };
        }

        return {
          ...activeWorkout,
          partElapsedTime: 0,
          activePart: action.partNumber,
          status: activeWorkout.status === 'paused' ? 'paused' : 'active',
        };
      }
    }
  };

  const memoizedReducer = React.useCallback(activeWorkoutReducer, []);
  const [activeWorkout, dispatchActiveWorkoutAction] = React.useReducer(
    memoizedReducer,
    {
      workout: null,
      activePart: 0,
      partElapsedTime: 0,
      status: 'not_started',
    }
  );

  const { setResistance, isConnected } = useSmartTrainer();
  React.useEffect(() => {
    if (!isConnected) return;
    const status = activeWorkout.status;
    const workout = activeWorkout.workout;

    if (status === 'active' && !workout) {
      // Don't reset current resistance when starting non-workout session
      return;
    }
    if (status !== 'active' || !workout) {
      setResistance(0);
    } else {
      const activeWorkoutPart = workout.parts[activeWorkout.activePart];
      const targetPowerAsWatt = wattFromFtpPercent(
        activeWorkoutPart.targetPower,
        activeFtp
      );
      setResistance(targetPowerAsWatt);
    }
  }, [
    /* NB: Only include the necessary attributes, since including the
     *     whole activeWorkout object would lead to a re-render every
     *     time activeWorkout.partElapsedTime is updated.
     * */
    activeWorkout.status,
    activeWorkout.activePart,
    activeWorkout.workout,
    setResistance,
    isConnected,
    activeFtp,
  ]);

  const setWorkout = (workout: Workout) => {
    dispatchActiveWorkoutAction({ type: 'SET_WORKOUT', workout });
  };

  const start = () => {
    dispatchActiveWorkoutAction({ type: 'START', setResistance, activeFtp });
  };

  const pause = () => {
    dispatchActiveWorkoutAction({ type: 'PAUSE', setResistance, activeFtp });
  };

  const syncResistanceIfActive = () => {
    if (!isConnected) return;

    const { status, workout } = activeWorkout;
    if (status !== 'active' || !workout) {
      setResistance(0);
    } else {
      syncResistance();
    }
  };

  const syncResistance = () => {
    const { workout } = activeWorkout;
    if (!isConnected || !workout) return;

    const activeWorkoutPart = workout.parts[activeWorkout.activePart];
    const targetPowerAsWatt = wattFromFtpPercent(
      activeWorkoutPart.targetPower,
      activeFtp
    );
    setResistance(targetPowerAsWatt);
  };

  const changeActivePart = (partNumber: number, addLap: () => void) => {
    dispatchActiveWorkoutAction({
      type: 'CHANGE_ACTIVE_PART',
      setResistance,
      activeFtp,
      addLap,
      partNumber,
    });
  };

  const increaseElapsedTime = (millis: number, addLap: () => void) => {
    dispatchActiveWorkoutAction({
      type: 'INCREASE_PART_ELAPSED_TIME',
      millis,
      setResistance,
      activeFtp,
      addLap,
    });
  };

  const partElapsedTimeAsSeconds = activeWorkout
    ? Math.floor(activeWorkout.partElapsedTime / 1000)
    : 0;
  return (
    <ActiveWorkoutContext.Provider
      value={{
        activeWorkout: {
          ...activeWorkout,
          partElapsedTime: partElapsedTimeAsSeconds,
        },
        setActiveWorkout: setWorkout,
        increaseElapsedTime,
        start,
        pause,
        activeFtp,
        setActiveFtp,
        changeActivePart,
        syncResistance,
        syncResistanceIfActive,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
};

export const useActiveWorkout = () => {
  const context = React.useContext(ActiveWorkoutContext);
  if (context === null) {
    throw new Error(
      'useActiveWorkout must be used within a WorkoutContextProvider'
    );
  }
  return context;
};

export const getRemainingTime = (activeWorkout: ActiveWorkout) => {
  const { workout, status, activePart, partElapsedTime } = activeWorkout;
  if (!workout || status === 'finished') return null;

  return workout.parts[activePart].duration - partElapsedTime;
};

export const getTargetPower = (
  activeWorkout: ActiveWorkout,
  activeFtp: number
) => {
  const { workout, status, activePart } = activeWorkout;
  if (!workout || status === 'finished') return null;
  return Math.floor((workout.parts[activePart].targetPower * activeFtp) / 100);
};
