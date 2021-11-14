import * as React from "react";
import { ActiveWorkout, Workout } from "../types";

export const WorkoutContext = React.createContext<{
  activeWorkout: ActiveWorkout | null;
  setActiveWorkout: (workout: Workout) => void;
} | null>(null);

export const ActiveWorkoutContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeWorkout, setActiveWorkout] =
    React.useState<ActiveWorkout | null>(null);

  const setWorkout = (workout: Workout) => {
    console.log("WorkoutContext: setWorkout", workout);
    setActiveWorkout({
      workout,
      activePart: 0,
      isDone: false,
      partElapsedTime: 0,
    });
  };

  return (
    <WorkoutContext.Provider
      value={{ activeWorkout, setActiveWorkout: setWorkout }}
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
