import * as React from 'react';
import {
  HeartRateMonitor,
  useHeartRateMonitorInterface,
} from '../hooks/useHeartRateMonitorInterface';
import { useHeartRateMonitorMock } from '../hooks/useHeartRateMonitorMock';

const HeartRateContext = React.createContext<HeartRateMonitor | null>(null);

export const HeartRateRealContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const heartRateMonitor = useHeartRateMonitorInterface();

  return (
    <HeartRateContext.Provider value={heartRateMonitor}>
      {children}
    </HeartRateContext.Provider>
  );
};

export const HeartRateMockContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const heartRateMonitor = useHeartRateMonitorMock();

  return (
    <HeartRateContext.Provider value={heartRateMonitor}>
      {children}
    </HeartRateContext.Provider>
  );
};

export const HeartRateContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const usingMockData = process.env.REACT_APP_USE_MOCK_DATA ? true : false;

  if (usingMockData) {
    return (
      <HeartRateMockContextProvider>{children}</HeartRateMockContextProvider>
    );
  } else {
    return (
      <HeartRateRealContextProvider>{children}</HeartRateRealContextProvider>
    );
  }
};

export const useHeartRateMonitor = () => {
  const context = React.useContext(HeartRateContext);
  if (context === null) {
    throw new Error(
      'useHeartRate must be used within a HeartRateContextProvider'
    );
  }
  return context;
};
