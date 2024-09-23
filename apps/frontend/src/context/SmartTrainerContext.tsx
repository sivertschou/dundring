import * as React from 'react';
import {
  SmartTrainerInterface,
  useSmartTrainerInterface,
} from '../hooks/useSmartTrainerInterface';
import { useSmartTrainerMock } from '../hooks/useSmartTrainerMock';

const SmartTrainerContext = React.createContext<SmartTrainerInterface | null>(
  null
);

export const SmartTrainerRealContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const smartTrainer = useSmartTrainerInterface();

  return (
    <SmartTrainerContext.Provider value={smartTrainer} children={children} />
  );
};

export const SmartTrainerMockContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const smartTrainer = useSmartTrainerMock();

  return (
    <SmartTrainerContext.Provider value={smartTrainer} children={children} />
  );
};

export const SmartTrainerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const usingMockData = import.meta.env.VITE_USE_MOCK_DATA ? true : false;

  // if (usingMockData)
  return <SmartTrainerMockContextProvider children={children} />;
  // return <SmartTrainerRealContextProvider children={children} />;
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
