import * as React from "react";
import { Workout, WorkoutContextType } from "../types";

export const defaultWorkout: WorkoutContextType = {
  workout: { name: "New Workout", parts: [] },
  partElapsedTime: 0,
  activePart: 0,
};

export const WorkoutContext = React.createContext(defaultWorkout);
