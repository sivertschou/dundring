import * as React from "react";
import { Workout } from "../types";

interface ActiveWorkout {
  workout: Workout;
  activePart: number;
  partElapsedTimeMs: number;
  isDone: boolean;
}
export const useWorkout = (
  smartTrainerIsConnected: boolean,
  power: number,
  setResistance: (resistance: number) => void
) => {
  const [activeWorkout, setActiveWorkout] = React.useState<ActiveWorkout>({
    workout: { name: "New workout", parts: [] },
    activePart: 0,
    partElapsedTimeMs: 0,
    isDone: false,
  });
  // const [partElapsedTimeMs, setPartElapsedTimeMs] = React.useState(0);
  // const [workout, setWorkout] = React.useState<Workout>({
  //   name: "",
  //   parts: [],
  // });
  // const [activePart, setActivePart] = React.useState(0);
  // const [isDone, setIsDone] = React.useState(false);
  React.useEffect(() => {
    console.log("active part changed");
    if (!smartTrainerIsConnected) {
      return;
    }
    if (activeWorkout.isDone) {
      setResistance(0);
    } else {
      setResistance(
        activeWorkout.workout.parts[activeWorkout.activePart].targetPower
      );
    }
  }, [activeWorkout.activePart]);

  const updateElapsedTime = React.useCallback((diff: number) => {
    setActiveWorkout((prev) => {
      if (!prev.isDone) {
        const { activePart: prevActivePart, workout: prevWorkout } = prev;
        const newElapsed = diff + prev.partElapsedTimeMs;
        const elapsedSeconds = Math.floor(newElapsed / 1000);
        const currentPartDuration = prevWorkout.parts[prevActivePart].duration;

        if (currentPartDuration < elapsedSeconds) {
          // Done with current part
          if (prevActivePart === prevWorkout.parts.length - 1) {
            // Done with every party
            return {
              ...prev,
              partElapsedTimeMs: 0,
              activePart: 0,
              isDone: true,
            };
          }

          return {
            ...prev,
            partElapsedTimeMs: newElapsed - currentPartDuration * 1000,
            activePart: prevActivePart + 1,
          } as ActiveWorkout;
        }

        return { ...prev, partElapsedTimeMs: newElapsed };
      }
      return prev;
    });
  }, []);

  return {
    workout: activeWorkout.workout,
    setWorkout: (workout: Workout) => {
      setActiveWorkout((prev) => ({ ...prev, workout, partElapsedTimeMs: 0 }));
    },
    activePart: activeWorkout.activePart,
    partElapsedTime: Math.floor(activeWorkout.partElapsedTimeMs / 1000),
    increaseElapsedTime: (diff: number) => {
      updateElapsedTime(diff);
    },
    isDone: activeWorkout.isDone,
  };
};
