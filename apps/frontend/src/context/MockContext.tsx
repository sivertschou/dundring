import React from 'react';

declare global {
  interface Window {
    toggleMock: () => void;
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
    window.toggleMock = () => {
      setMocking((prev) => !prev);
    };
  }, [mocking]);

  return (
    <MockContext.Provider value={{ mocking }}>{children}</MockContext.Provider>
  );
};

export function useMockSettings() {
  const context = React.useContext(MockContext);
  if (context === null) {
    throw new Error('useMockSettings must be used within a MockProvider');
  }
  return context;
}
