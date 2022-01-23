import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { UserContextProvider } from './context/UserContext';
import { HeartRateContextProvider } from './context/HeartRateContext';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
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
ReactDOM.render(
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
  </React.StrictMode>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
