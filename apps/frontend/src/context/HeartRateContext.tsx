import * as React from 'react';
import {
  HeartRateMonitorInterface,
  useHeartRateMonitorInterface,
} from '../hooks/useHeartRateMonitorInterface';
import { useHeartRateMonitorMock } from '../hooks/useHeartRateMonitorMock';
import { useMockSettings } from './MockContext';

const HeartRateContext = React.createContext<HeartRateMonitorInterface | null>(
  null
);

export const HeartRateContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { mocking } = useMockSettings();
  const heartRateMonitor = useHeartRateMonitorInterface();
  const mockHeartRateMonitor = useHeartRateMonitorMock();

  if (mocking) {
    return (
      <HeartRateContext.Provider value={mockHeartRateMonitor}>
        {children}
      </HeartRateContext.Provider>
    );
  } else {
    return (
      <HeartRateContext.Provider value={heartRateMonitor}>
        {children}
      </HeartRateContext.Provider>
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
