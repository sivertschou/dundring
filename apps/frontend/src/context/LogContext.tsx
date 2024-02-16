import * as React from 'react';

interface LogMsg {
	msg: string;
	timestamp: Date;
}

const LogContext = React.createContext<{
	loggedEvents: LogMsg[];
	logEvent: (msg: string) => void;
} | null>(null);

export const LogContextProvider = ({children}: {children: React.ReactNode}) => {
	const [loggedEvents, setLoggedEvents] = React.useState<LogMsg[]>([]);

	return (
		<LogContext.Provider
			value={{
				loggedEvents,
				logEvent: React.useCallback(
					(msg: string) =>
						setLoggedEvents(prev => [{msg, timestamp: new Date()}, ...prev]),
					[setLoggedEvents],
				),
			}}
		>
			{children}
		</LogContext.Provider>
	);
};

export const useLogs = () => {
	const context = React.useContext(LogContext);
	if (context === null) {
		throw new Error('useLogs must be used within a LogContextProvider');
	}
	return context;
};
