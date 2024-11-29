import * as React from 'react';
import { useData } from './DataContext';

const WakeLockContext = React.createContext(null);

export const WakeLockContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isRunning } = useData();
  const [wakeLock, setWakeLock] = React.useState<WakeLockSentinel | null>(null);

  const documentVisibility = React.useSyncExternalStore(
    (callback) => {
      document.addEventListener('visibilitychange', callback);
      return () => {
        document.removeEventListener('visibilitychange', callback);
      };
    },
    () => document.visibilityState
  );

  const acquireWakeLock = async () => {
    const wl = await navigator.wakeLock.request('screen');
    setWakeLock(wl);
    wl.addEventListener('release', () => {
      setWakeLock(null);
    });
  };
  React.useEffect(() => {
    if (isRunning && documentVisibility === 'visible') {
      acquireWakeLock().catch(() => console.warn('Could not acquire wakeLock'));
    } else if (wakeLock) {
      wakeLock
        .release()
        .catch(() => console.warn('Could not release wakeLock'));
    }
  }, [isRunning, documentVisibility]);

  return (
    <WakeLockContext.Provider value={null}>{children}</WakeLockContext.Provider>
  );
};
