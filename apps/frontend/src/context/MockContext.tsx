import React from 'react';

declare global {
  interface Window {
    setMock: (b?: boolean) => void;
    mockHr: number | null;
    mockWatt: number | null;
  }
}

const mockingOnFromEnvironment =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  import.meta.env.VITE_USE_MOCK_DATA === 'TRUE' ||
  false;

const MockContext = React.createContext<{
  mocking: boolean;
} | null>({
  mocking: mockingOnFromEnvironment,
});

export const MockProvider = ({ children }: { children: React.ReactNode }) => {
  const [mocking, setMocking] = React.useState(false);
  React.useEffect(() => {
    window.setMock = (b: any) => {
      if (b === undefined) {
        setMocking(true);
      }
      if (typeof b === 'boolean') {
        setMocking(b);
      }
    };
  }, [mocking]);

  return (
    <MockContext.Provider value={{ mocking }}>{children}</MockContext.Provider>
  );
};

export function useMockSettings() {
  const context = React.useContext(MockContext);
  if (context === null) {
    throw new Error(
      'useSmartTrainer must be used within a SmartTrainerContextProvider'
    );
  }
  return context;
}
