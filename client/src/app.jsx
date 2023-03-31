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
import { ErrorPage } from "./pages/ErrorPage.jsx";
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

const api_endpoint = window.internal.getAPIEndpoint;

// routes used in the app
const router = createHashRouter(
  createRoutesFromElements(
    <>
      {/* <Route path="/" element={<Email />} errorElement={<ErrorPage />} /> */}
      <Route path="/signup" element={<Signup />} errorElement={<ErrorPage />} />
      <Route path="/password" element={<Password />} errorElement={<ErrorPage />} />
      <Route path="/sensor" element={<Sensor />} errorElement={<ErrorPage />} />
      <Route path="/camera" element={<Camera />} errorElement={<ErrorPage />} />
      <Route
        path="/"
        element={
          // <RequireAuth>
          <Vault />
          // <RequireAuth>
        }
        loader={async () => {
          return {
            json: [
              {
                date: "2023-03-29 22:50:13",
                file_name: "picture",
                file_type: "image/jpeg",
                id: "aa35b09c-ddec-425f-acf4-442ead625aeb",
                size: 1859839,
              },
              {
                date: "2023-03-29 22:50:24",
                file_name: "picture2",
                file_type: "image/jpeg",
                id: "7093be37-dd7e-48e4-b0bd-33da2731eb4b",
                size: 1397795,
              },
            ],
            msg: "File fetch successful.",
            success: 1,
          };
          const response = await fetch(`${api_endpoint}/api/client/files/list/`, {
            body: JSON.stringify({
              auth_session_id: auth,
            }),
          });
          return await response.json();
        }}
        errorElement={<ErrorPage />}
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
    background: {
      paper: "#1E2839",
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
