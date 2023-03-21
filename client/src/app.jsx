import * as React from "react";
import { useState, createContext } from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import {
  Routes,
  Route,
  Router,
  HashRouter,
  createHashRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { Password } from "./pages/password.jsx";
import { Email } from "./pages/email.jsx";
import { Vault } from "./pages/vault.jsx";
import { RequireAuth } from "./hooks/RequireAuth.js";
import { Sensor } from "./pages/sensor.jsx";
import { Camera } from "./pages/camera.jsx";

// variables for authentication with admin
export const authContext = createContext(null);
export const sessionContext = createContext(null);

// routes used in the app
const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Email />} />
      <Route path="/password" element={<Password />} />
      <Route path="/sensor" element={<Sensor />} />
      <Route path="/camera" element={<Camera />} />
      <Route
        path="/vault"
        element={
          <RequireAuth>
            <Vault />
          </RequireAuth>
        }
      />
    </>
  )
);

const App = () => {
  // the states for the authentication (to modify context later)
  const [session, setSession] = useState(null);
  const [auth, setAuth] = useState(null);
  return (
    <authContext.Provider value={[auth, setAuth]}>
      <sessionContext.Provider value={[session, setSession]}>
        <RouterProvider router={router} />
      </sessionContext.Provider>
    </authContext.Provider>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);
