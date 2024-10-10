import * as React from 'react';
import {
  SmartTrainerInterface,
  useSmartTrainerInterface,
} from '../hooks/useSmartTrainerInterface';
import { useSmartTrainerMock } from '../hooks/useSmartTrainerMock';
import { useMockSettings } from './MockContext';

const SmartTrainerContext = React.createContext<SmartTrainerInterface | null>(
  null
);

export const SmartTrainerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { mocking } = useMockSettings();
  const mockTrainer = useSmartTrainerMock();
  const smartTrainer = useSmartTrainerInterface();
  if (mocking) {
    return (
      <SmartTrainerContext.Provider value={mockTrainer} children={children} />
    );
  }
  return (
    <SmartTrainerContext.Provider value={smartTrainer} children={children} />
  );
};

export const useSmartTrainer = () => {
  const context = React.useContext(SmartTrainerContext);
  if (context === null) {
    throw new Error(
      'useSmartTrainer must be used within a SmartTrainerContextProvider'
    );
  }
  return context;
};
