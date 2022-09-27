import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { Route, Routes } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { initDatadog } from "./datadog";

import { store } from "./app/store";
import { chains, client as WagmiClient } from "./app/wagmi";
import reportWebVitals from "./reportWebVitals";
import history from "./history";

import "./index.css";

// Routes
import CreateProgram from "./features/program/CreateProgramPage";
import CreateRound from "./features/round/CreateRoundPage";
import Program from "./features/program/ListProgramPage";
import Auth from "./features/common/Auth";
import ViewProgram from "./features/program/ViewProgramPage";
import ViewRoundPage from "./features/round/ViewRoundPage";
import ViewApplication from "./features/round/ViewApplicationPage";
import NotFound from "./features/common/NotFoundPage";
import AccessDenied from "./features/common/AccessDenied";
import { ReadProgramProvider } from "./context/program/ReadProgramContext";
import { ApplicationProvider } from "./context/application/ApplicationContext";
import { CreateProgramProvider } from "./context/program/CreateProgramContext";

// Initialize datadog
initDatadog();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiConfig client={WagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ReduxRouter history={history} store={store}>
            <Routes>
              {/* Protected Routes */}
              <Route element={<Auth />}>
                {/* Default Route */}
                <Route
                  path="/"
                  element={
                    <ReadProgramProvider>
                      <Program />
                    </ReadProgramProvider>
                  }
                />

                {/* Round Routes */}
                <Route
                  path="/round/create"
                  element={
                    <ReadProgramProvider>
                      <CreateRound />
                    </ReadProgramProvider>
                  }
                />
                <Route
                  path="/round/:id"
                  element={
                    <ApplicationProvider>
                      <ViewRoundPage />
                    </ApplicationProvider>
                  }
                />
                <Route
                  path="/round/:roundId/application/:id"
                  element={
                    <ApplicationProvider>
                      <ViewApplication />
                    </ApplicationProvider>
                  }
                />

                {/* Program Routes */}
                <Route
                  path="/program/create"
                  element={
                    <CreateProgramProvider>
                      <CreateProgram />
                    </CreateProgramProvider>
                  }
                />
                <Route
                  path="/program/:id"
                  element={
                    <ReadProgramProvider>
                      <ViewProgram />
                    </ReadProgramProvider>
                  }
                />

                {/* Access Denied */}
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ReduxRouter>
        </RainbowKitProvider>
      </WagmiConfig>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
