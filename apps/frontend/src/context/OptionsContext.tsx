import * as React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type Options = {
  intervalSounds: { value: boolean; set: (b: boolean) => void };
};

const OptionsContext = React.createContext<Options | null>(null);

const useOptionSetting = (key: string, initialValue: boolean) => {
  const [value, setValue] = useLocalStorage<boolean>(key, initialValue);

  return { value, set: setValue };
};

export const OptionsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const intervalSoundsOption = useOptionSetting('intervalsSounds', false);

  return (
    <OptionsContext.Provider
      value={{
        intervalSounds: intervalSoundsOption,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptionsContext = () => {
  const context = React.useContext(OptionsContext);
  if (context === null) {
    throw new Error('useLogs must be used within a LogContextProvider');
  }
  return context;
};
