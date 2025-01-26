import * as React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type ReadAndWriteOption = { value: boolean; set: (b: boolean) => void };

type ReadOption = boolean;

type Options<T> = {
  playIntervalCountdownSounds: T;
  showIntervalTimer: T;
  showTotalDurationTimer: T;
};

const OptionsContext = React.createContext<Options<ReadAndWriteOption> | null>(
  null
);

const useOptionSetting = (key: string, initialValue: boolean) => {
  const [value, setValue] = useLocalStorage<boolean>(key, initialValue);

  return { value, set: setValue };
};

export const OptionsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const playIntervalCountdownSounds = useOptionSetting(
    'playIntervalCountdownSounds',
    false
  );

  const showIntervalTimer = useOptionSetting('showIntervalTimer', true);
  const showTotalDurationTimer = useOptionSetting(
    'showTotalDurationTimer',
    true
  );

  return (
    <OptionsContext.Provider
      value={{
        playIntervalCountdownSounds,
        showIntervalTimer,
        showTotalDurationTimer,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

export const useReadWriteOptions: () => Options<ReadAndWriteOption> = () => {
  const context = React.useContext(OptionsContext);
  if (context === null) {
    throw new Error('useLogs must be used within a LogContextProvider');
  }
  return context;
};

export const useReadOptions: () => Options<ReadOption> = () => {
  const context = React.useContext(OptionsContext);
  if (context === null) {
    throw new Error('useLogs must be used within a LogContextProvider');
  }
  const result = {} as Options<ReadOption>;

  Object.entries(context).forEach(
    ([k, v]) => (result[k as keyof Options<ReadOption>] = v.value)
  );

  return result;
};
