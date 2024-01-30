import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { UserContextProvider } from './context/UserContext';
import { HeartRateContextProvider } from './context/HeartRateContext';
import { SmartTrainerContextProvider } from './context/SmartTrainerContext';
import { WebsocketContextProvider } from './context/WebsocketContext';
import WorkerBuilder from './workers/workerBuilder';
import clockWorker from './workers/clock.worker';
import { LogContextProvider } from './context/LogContext';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';
import { ModalContextProvider } from './context/ModalContext';
import { DataContextProvider } from './context/DataContext';
import { ActiveWorkoutContextProvider } from './context/ActiveWorkoutContext';

const cw: Worker = new WorkerBuilder(clockWorker);
cw.postMessage('startDataTimer');

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <LogContextProvider>
          <UserContextProvider>
            <HeartRateContextProvider>
              <SmartTrainerContextProvider>
                <ActiveWorkoutContextProvider>
                  <WebsocketContextProvider>
                    <DataContextProvider clockWorker={cw}>
                      <ModalContextProvider>
                        <ColorModeScript />
                        <App />
                      </ModalContextProvider>
                    </DataContextProvider>
                  </WebsocketContextProvider>
                </ActiveWorkoutContextProvider>
              </SmartTrainerContextProvider>
            </HeartRateContextProvider>
          </UserContextProvider>
        </LogContextProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
