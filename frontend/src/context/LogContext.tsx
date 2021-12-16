import * as React from 'react';

interface LogMsg {
  msg: string;
  timestamp: Date;
}

const LogContext = React.createContext<{
  log: LogMsg[];
  add: (msg: string) => void;
} | null>(null);

export const LogContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [log, setLog] = React.useState<LogMsg[]>([]);

  return (
    <LogContext.Provider
      value={{
        log,
        add: (msg: string) =>
          setLog((prev) => [{ msg, timestamp: new Date() }, ...prev]),
      }}
    >
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => {
  const context = React.useContext(LogContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
};
