import * as React from 'react';
import { ActiveWorkoutSession, Workout } from '../types';
import { wattFromFtpPercent } from '../utils/general';
import { useSmartTrainer } from './SmartTrainerContext';
import { useUser } from './UserContext';

export const ActiveWorkoutSessionContext = React.createContext<{
  activeWorkoutSession: ActiveWorkoutSession;
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
export const ActiveWorkoutSessionContextProvider = ({
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
    activeWorkoutSession: ActiveWorkoutSession,
    action: ActiveWorkoutAction
  ): ActiveWorkoutSession => {
    switch (action.type) {
      case 'SET_WORKOUT':
        return {
          workout: action.workout,
          activePart: 0,
          status: 'not_started',
          partElapsedTime: 0,
        };
      case 'INCREASE_PART_ELAPSED_TIME':
        if (activeWorkoutSession.status !== 'active') {
          return activeWorkoutSession;
        }

        const newElapsed = action.millis + activeWorkoutSession.partElapsedTime;

        if (!activeWorkoutSession.workout) {
          return { ...activeWorkoutSession, partElapsedTime: newElapsed };
        }

        const elapsedSeconds = Math.floor(newElapsed / 1000);
        const prevActivePart = activeWorkoutSession.activePart;
        const prevWorkoutParts = activeWorkoutSession.workout.parts;
        const currentPartDuration = prevWorkoutParts[prevActivePart].duration;
        if (currentPartDuration < elapsedSeconds) {
          // Done with current part
          if (prevActivePart === prevWorkoutParts.length - 1) {
            // Done with every part
            const nextState: ActiveWorkoutSession = {
              ...activeWorkoutSession,
              partElapsedTime: 0,
              activePart: 0,
              status: 'finished',
            };
            action.addLap();
            return nextState;
          }
          // Only done with current part, other parts unfinished
          const nextState: ActiveWorkoutSession = {
            ...activeWorkoutSession,
            partElapsedTime: newElapsed - currentPartDuration * 1000,
            activePart: activeWorkoutSession.activePart + 1,
          };
          action.addLap();
          return nextState;
        }
        // Current part is not finished
        return { ...activeWorkoutSession, partElapsedTime: newElapsed };
      case 'START': {
        const nextState: ActiveWorkoutSession = {
          ...activeWorkoutSession,
          status: 'active',
        };
        return nextState;
      }
      case 'PAUSE': {
        const nextState: ActiveWorkoutSession = {
          ...activeWorkoutSession,
          status: 'paused',
        };
        return nextState;
      }
      case 'CHANGE_ACTIVE_PART': {
        if (!activeWorkoutSession.workout) return activeWorkoutSession;

        action.addLap();

        if (action.partNumber >= activeWorkoutSession.workout.parts.length) {
          return {
            ...activeWorkoutSession,
            partElapsedTime: 0,
            status: 'finished',
          };
        }

        setResistance(
          activeWorkoutSession.workout.parts[action.partNumber].targetPower
        );
        return {
          ...activeWorkoutSession,
          partElapsedTime: 0,
          activePart: action.partNumber,
          status:
            activeWorkoutSession.status === 'paused' ? 'paused' : 'active',
        };
      }
    }
  };

  const memoizedReducer = React.useCallback(activeWorkoutReducer, []);
  const [activeWorkoutSession, dispatchActiveWorkoutAction] = React.useReducer(
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
    const status = activeWorkoutSession.status;
    const workout = activeWorkoutSession.workout;

    if (status !== 'active' || !workout) {
      setResistance(0);
    } else {
      const activeWorkoutPart = workout.parts[activeWorkoutSession.activePart];
      const targetPowerAsWatt = wattFromFtpPercent(
        activeWorkoutPart.targetPower,
        activeFtp
      );
      setResistance(targetPowerAsWatt);
    }
  }, [
    /* NB: Only include the necessary attributes, since including the
     *     whole activeWorkout object would lead to a re-render every
     *     time activeWorkoutSession.partElapsedTime is updated.
     * */
    activeWorkoutSession.status,
    activeWorkoutSession.activePart,
    activeWorkoutSession.workout,
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
    const { workout } = activeWorkoutSession;
    if (!isConnected || !workout) return;

    const activeWorkoutPart = workout.parts[activeWorkoutSession.activePart];
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

  const partElapsedTimeAsSeconds = activeWorkoutSession
    ? Math.floor(activeWorkoutSession.partElapsedTime / 1000)
    : 0;
  return (
    <ActiveWorkoutSessionContext.Provider
      value={{
        activeWorkoutSession: {
          ...activeWorkoutSession,
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
    </ActiveWorkoutSessionContext.Provider>
  );
};

export const useActiveWorkoutSession = () => {
  const context = React.useContext(ActiveWorkoutSessionContext);
  if (context === null) {
    throw new Error(
      'useActiveWorkout must be used within a WorkoutContextProvider'
    );
  }
  return context;
};

export const getRemainingTime = (
  activeWorkoutSession: ActiveWorkoutSession
) => {
  const { workout, status, activePart, partElapsedTime } = activeWorkoutSession;
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
