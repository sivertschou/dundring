import * as React from 'react';
import { ActiveWorkout, Workout } from '../types';
import { wattFromFtpPercent } from '../utils';
import { useSmartTrainer } from './SmartTrainerContext';
import { useUser } from './UserContext';

export const WorkoutContext = React.createContext<{
  activeWorkout: ActiveWorkout;
  setActiveWorkout: (workout: Workout) => void;
  increaseElapsedTime: (millis: number, addLap: () => void) => void;
  start: () => void;
  pause: () => void;
  activeFTP: number;
  setActiveFTP: (ftp: number) => void;
  changeActivePart: (partNumber: number) => void;
  syncResistance: () => void;
} | null>(null);

interface IncreasePartElapsedTimeAction {
  type: 'INCREASE_PART_ELAPSED_TIME';
  millis: number;
  setResistance: (resistance: number) => void;
  activeFTP: number;
  addLap: () => void;
}

interface SetWorkoutAction {
  type: 'SET_WORKOUT';
  workout: Workout;
}

interface StartAction {
  type: 'START';
  setResistance: (resistance: number) => void;
  activeFTP: number;
}
interface PauseAction {
  type: 'PAUSE';
  setResistance: (resistance: number) => void;
  activeFTP: number;
}

interface ChangeActivePartAction {
  type: 'CHANGE_ACTIVE_PART';
  setResistance: (resistance: number) => void;
  activeFTP: number;
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
  const [activeFTP, setActiveFTP] = React.useState(
    (user.loggedIn && user.ftp) || 250
  );
  React.useEffect(() => {
    // TODO: This might get triggered when other updates are made to user.
    if (user.loggedIn && user.ftp) {
      setActiveFTP(user.ftp);
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
          isActive: false,
          isDone: false,
          partElapsedTime: 0,
          activeFTP: 0,
        };
      case 'INCREASE_PART_ELAPSED_TIME':
        if (!activeWorkout.workout || !activeWorkout.isActive)
          return activeWorkout;

        const newElapsed = action.millis + activeWorkout.partElapsedTime;
        const elapsedSeconds = Math.floor(newElapsed / 1000);
        const prevActivePart = activeWorkout.activePart;
        const prevWorkoutParts = activeWorkout.workout.parts;
        const currentPartDuration = prevWorkoutParts[prevActivePart].duration;
        if (currentPartDuration < elapsedSeconds) {
          // Done with current part
          if (prevActivePart === prevWorkoutParts.length - 1) {
            // Done with every part
            const nextState = {
              ...activeWorkout,
              partElapsedTime: 0,
              activePart: 0,
              isDone: true,
              isActive: false,
            };
            action.addLap();
            return nextState;
          }
          // Only done with current part, other parts unfinished
          const nextState = {
            ...activeWorkout,
            partElapsedTime: newElapsed - currentPartDuration * 1000,
            activePart: activeWorkout.activePart + 1,
            isDone: false,
            isActive: true,
          };
          action.addLap();
          return nextState;
        }
        // Current part is not finished
        return { ...activeWorkout, partElapsedTime: newElapsed };
      case 'START': {
        const nextState = { ...activeWorkout, isActive: true };
        return nextState;
      }
      case 'PAUSE': {
        const nextState = { ...activeWorkout, isActive: false };
        return nextState;
      }
      case 'CHANGE_ACTIVE_PART': {
        const nextState = {
          ...activeWorkout,
          partElapsedTime: 0,
          activePart: action.partNumber,
        };
        action.addLap();
        return nextState;
      }
    }
  };

  const memoizedReducer = React.useCallback(activeWorkoutReducer, []);
  const [activeWorkout, dispatchActiveWorkoutAction] = React.useReducer(
    memoizedReducer,
    {
      workout: null,
      activePart: 0,
      isDone: false,
      partElapsedTime: 0,
      isActive: false,
      activeFTP,
    }
  );

  const { setResistance, isConnected } = useSmartTrainer();
  React.useEffect(() => {
    if (!isConnected) return;
    const isDone = activeWorkout.isDone;
    const isActive = activeWorkout.isActive;
    const workout = activeWorkout.workout;
    if (isDone || !isActive || !workout) {
      setResistance(0);
    } else {
      const activeWorkoutPart = workout.parts[activeWorkout.activePart];
      const targetPowerAsWatt = wattFromFtpPercent(
        activeWorkoutPart.targetPower,
        activeFTP
      );
      setResistance(targetPowerAsWatt);
    }
  }, [
    activeWorkout.isDone,
    activeWorkout.isActive,
    activeWorkout.activeFTP,
    activeWorkout.activePart,
    activeWorkout.workout,
    setResistance,
    isConnected,
    activeFTP,
  ]);

  const setWorkout = (workout: Workout) => {
    dispatchActiveWorkoutAction({ type: 'SET_WORKOUT', workout });
  };

  const start = () => {
    dispatchActiveWorkoutAction({ type: 'START', setResistance, activeFTP });
  };
  const pause = () => {
    dispatchActiveWorkoutAction({ type: 'PAUSE', setResistance, activeFTP });
  };
  const syncResistance = () => {
    if (!isConnected) return;

    const isDone = activeWorkout.isDone;
    const isActive = activeWorkout.isActive;
    const workout = activeWorkout.workout;
    if (isDone || !isActive || !workout) {
      setResistance(0);
    } else {
      const activeWorkoutPart = workout.parts[activeWorkout.activePart];
      const targetPowerAsWatt = wattFromFtpPercent(
        activeWorkoutPart.targetPower,
        activeFTP
      );
      setResistance(targetPowerAsWatt);
    }
  };

  const changeActivePart = (partNumber: number) => {
    dispatchActiveWorkoutAction({
      type: 'CHANGE_ACTIVE_PART',
      setResistance,
      activeFTP,
      addLap: () => {},
      partNumber: partNumber,
    });
  };

  const increaseElapsedTime = (millis: number, addLap: () => void) => {
    dispatchActiveWorkoutAction({
      type: 'INCREASE_PART_ELAPSED_TIME',
      millis,
      setResistance,
      activeFTP,
      addLap,
    });
  };

  const partElapsedTimeAsSeconds = activeWorkout
    ? Math.floor(activeWorkout.partElapsedTime / 1000)
    : 0;
  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout: {
          ...activeWorkout,
          partElapsedTime: partElapsedTimeAsSeconds,
        },
        setActiveWorkout: setWorkout,
        increaseElapsedTime,
        start,
        pause,
        activeFTP,
        setActiveFTP,
        changeActivePart: changeActivePart,
        syncResistance,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useActiveWorkout = () => {
  const context = React.useContext(WorkoutContext);
  if (context === null) {
    throw new Error(
      'useActiveWorkout must be used within a WorkoutContextProvider'
    );
  }
  return context;
};
