import * as React from "react";
import { useState, createContext, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { reactLocalStorage } from "reactjs-localstorage";
import { purple } from "@mui/material/colors";
import { createTheme, ThemeProvider } from "@mui/material";
import {
  Routes,
  Route,
  Router,
  HashRouter,
  createHashRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { Password } from "./pages/Password.jsx";
import { Email } from "./pages/Email.jsx";
import { Vault } from "./pages/Vault.jsx";
import { RequireAuth } from "./components/RequireAuth.js";
import { Sensor } from "./pages/Sensor.jsx";
import { Camera } from "./pages/Camera.jsx";
import { Signup } from "./pages/Signup.jsx";
import "./index.css";

// variables for authentication with admin
export const authContext = createContext(null);
export const sessionContext = createContext(null);

// routes used in the app
const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Email />} />
      <Route path="/signup" element={<Signup />} />
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

const theme = createTheme({
  palette: {
    primary: {
      // This is green.A700 as hex.
      main: "#11cb5f",
    },
    secondary: {
      // Purple and green play nicely together.
      main: purple[500],
    },
  },
});

const App = () => {
  // the states for the authentication (to modify context later)
  // cached in local storage
  const [session, setSession] = useState(() => reactLocalStorage.get("session_id", null));
  const [auth, setAuth] = useState(() => {
    reactLocalStorage.get("auth_id", null);
  });

  useEffect(() => {
    reactLocalStorage.set("session_id", session);
  }, [session]);

  useEffect(() => {
    reactLocalStorage.set("auth_id", auth);
  }, [auth]);

  return (
    <authContext.Provider value={[auth, setAuth]}>
      <sessionContext.Provider value={[session, setSession]}>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </sessionContext.Provider>
    </authContext.Provider>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);
