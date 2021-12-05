import * as React from "react";
import { ActiveWorkout, Workout } from "../types";
import { useSmartTrainer } from "./SmartTrainerContext";

export const WorkoutContext = React.createContext<{
  activeWorkout: ActiveWorkout;
  setActiveWorkout: (workout: Workout) => void;
  increaseElapsedTime: (millis: number, addLap: () => void) => void;
  start: () => void;
  pause: () => void;
} | null>(null);

interface IncreasePartElapsedTimeAction {
  type: "INCREASE_PART_ELAPSED_TIME";
  millis: number;
  setResistance: (resistance: number) => void;
  addLap: () => void;
}

interface SetWorkoutAction {
  type: "SET_WORKOUT";
  workout: Workout;
}

interface StartAction {
  type: "START";
  setResistance: (resistance: number) => void;
}
interface PauseAction {
  type: "PAUSE";
  setResistance: (resistance: number) => void;
}

type ActiveWorkoutAction =
  | IncreasePartElapsedTimeAction
  | SetWorkoutAction
  | StartAction
  | PauseAction;
export const ActiveWorkoutContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const activeWorkoutReducer = (
    activeWorkout: ActiveWorkout,
    action: ActiveWorkoutAction
  ): ActiveWorkout => {
    const syncResistance = (
      activeWorkout: ActiveWorkout,
      setResistance: (resistance: number) => void
    ) => {
      if (activeWorkout.isDone || !activeWorkout.workout) {
        setResistance(0);
      } else {
        const activeWorkoutPart =
          activeWorkout.workout.parts[activeWorkout.activePart];
        setResistance(activeWorkoutPart.targetPower);
      }
    };
    switch (action.type) {
      case "SET_WORKOUT":
        return {
          workout: action.workout,
          activePart: 0,
          isActive: false,
          isDone: false,
          partElapsedTime: 0,
        };
      case "INCREASE_PART_ELAPSED_TIME":
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
            syncResistance(nextState, action.setResistance);
            action.addLap();
            return nextState;
          }
          const nextState = {
            ...activeWorkout,
            partElapsedTime: newElapsed - currentPartDuration * 1000,
            activePart: activeWorkout.activePart + 1,
            isDone: false,
            isActive: true,
          };

          syncResistance(nextState, action.setResistance);
          action.addLap();
          return nextState;
        }

        return { ...activeWorkout, partElapsedTime: newElapsed };
      case "START": {
        const nextState = { ...activeWorkout, isActive: true };
        syncResistance(nextState, action.setResistance);
        return nextState;
      }
      case "PAUSE": {
        const nextState = { ...activeWorkout, isActive: false };
        syncResistance(nextState, action.setResistance);
        return nextState;
      }
      default:
        return activeWorkout;
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
    }
  );

  const { setResistance } = useSmartTrainer();

  const setWorkout = (workout: Workout) => {
    dispatchActiveWorkoutAction({ type: "SET_WORKOUT", workout });
  };

  const start = () => {
    dispatchActiveWorkoutAction({ type: "START", setResistance });
  };
  const pause = () => {
    dispatchActiveWorkoutAction({ type: "PAUSE", setResistance });
  };

  const increaseElapsedTime = (millis: number, addLap: () => void) => {
    dispatchActiveWorkoutAction({
      type: "INCREASE_PART_ELAPSED_TIME",
      millis,
      setResistance,
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
      "useActiveWorkout must be used within a WorkoutContextProvider"
    );
  }
  return context;
};
