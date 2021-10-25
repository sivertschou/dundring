import * as React from "react";
import { WorkoutContextType } from "../types";

export const defaultWorkout: WorkoutContextType = {
  workout: { name: "New Workout", parts: [] },
  partElapsedTime: 0,
  activePart: 0,
  isDone: false,
};

export const WorkoutContext = React.createContext(defaultWorkout);
