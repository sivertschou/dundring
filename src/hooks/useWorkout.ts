import * as React from "react";
import { Workout } from "../types";

export const useWorkout = () => {
  const [partElapsedTime, setPartElapsedTime] = React.useState(0);
  const [workout, setWorkout] = React.useState<Workout>({
    name: "",
    parts: [],
  });
  const [activePart, setActivePart] = React.useState(0);
  const [isDone, setIsDone] = React.useState(false);

  //   const remainingTime = workout?.parts[activePart].duration - activePart
  return {
    workout,
    setWorkout: (workout: Workout) => {
      setWorkout(workout);
      setPartElapsedTime(0);
    },
    activePart,
    partElapsedTime,
    increaseElapsedTime: (diff: number) => {
      if (!isDone) {
        setPartElapsedTime((prev) => {
          const newElapsed = diff + prev;
          const currentPartDuration = workout.parts[activePart].duration;

          if (currentPartDuration < newElapsed) {
            // Done with current part
            if (activePart === workout.parts.length - 1) {
              // Done with every party
              setIsDone(true);
            }

            setActivePart(activePart + 1);
            return newElapsed - currentPartDuration;
          }

          return newElapsed;
        });
      }
    },
  };
};
