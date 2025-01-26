import * as React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type Options = {
  intervalSounds: { value: boolean; set: (b: boolean) => void };
  showIntervalTimer: { value: boolean; set: (b: boolean) => void };
  showTotalDurationTimer: { value: boolean; set: (b: boolean) => void };
  showHeartRateCurrent: { value: boolean; set: (b: boolean) => void };
  showHeartRateMax: { value: boolean; set: (b: boolean) => void };
  showCadence: { value: boolean; set: (b: boolean) => void };
  showMap: { value: boolean; set: (b: boolean) => void };
  showGraph: { value: boolean; set: (b: boolean) => void };
  showPowerBar: { value: boolean; set: (b: boolean) => void };
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
  const intervalSounds = useOptionSetting('intervalsSounds', false);

  const showIntervalTimer = useOptionSetting('showIntervalTimer', true);
  const showTotalDurationTimer = useOptionSetting(
    'showTotalDurationTimer',
    true
  );

  const showHeartRateCurrent = useOptionSetting('showHeartRateCurrent', true);
  const showHeartRateMax = useOptionSetting('showHeartRateMax', true);

  const showCadence = useOptionSetting('showCadence', true);

  const showMap = useOptionSetting('showMap', true);
  const showGraph = useOptionSetting('showGraph', true);
  const showPowerBar = useOptionSetting('showPowerBar', true);

  return (
    <OptionsContext.Provider
      value={{
        intervalSounds,
        showIntervalTimer,
        showTotalDurationTimer,
        showHeartRateCurrent,
        showHeartRateMax,
        showCadence,
        showMap,
        showGraph,
        showPowerBar,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};

// TODO
export const useOptions = () => {
  const context = React.useContext(OptionsContext);
  if (context === null) {
    throw new Error('useLogs must be used within a LogContextProvider');
  }
  return context;
};
