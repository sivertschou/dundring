import { ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { UserContextProvider } from "./context/UserContext";
import { HeartRateContextProvider } from "./context/HeartRateContext";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";
import { SmartTrainerContextProvider } from "./context/SmartTrainerContext";
import { ActiveWorkoutContextProvider } from "./context/WorkoutContext";
import { WebsocketContextProvider } from "./context/WebsocketContext";
import WorkerBuilder from "./workers/workerBuilder";
import clockWorker from "./workers/clock.worker";

const cw: Worker = new WorkerBuilder(clockWorker);
cw && cw.postMessage("startTimer");
ReactDOM.render(
  <React.StrictMode>
    <UserContextProvider>
      <HeartRateContextProvider>
        <SmartTrainerContextProvider>
          <ActiveWorkoutContextProvider>
            <WebsocketContextProvider>
              <ColorModeScript />
              <App clockWorker={cw} />
            </WebsocketContextProvider>
          </ActiveWorkoutContextProvider>
        </SmartTrainerContextProvider>
      </HeartRateContextProvider>
    </UserContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
