import * as React from "react";
import {
  HeartRateMonitor,
  useHeartRateMonitor,
} from "../hooks/useHeartRateMonitor";

const HeartRateContext = React.createContext<HeartRateMonitor | null>(null);

export const HeartRateContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const heartRateMonitor = useHeartRateMonitor();

  return (
    <HeartRateContext.Provider value={heartRateMonitor}>
      {children}
    </HeartRateContext.Provider>
  );
};

export const useHeartRate = () => {
  const context = React.useContext(HeartRateContext);
  if (context === null) {
    throw new Error("useUser must be used within a HeartRateContextProvider");
  }
  return context;
};
