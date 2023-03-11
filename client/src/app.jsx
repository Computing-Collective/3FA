import * as React from "react";
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
import { Lock } from "./pages/lock.jsx";
import { Email } from "./pages/email.jsx";
import { Vault } from "./pages/vault.jsx";
import { RequireAuth } from "./hooks/RequireAuth.js";

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Email />} />
      <Route path="/lock" element={<Lock />} />
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
// variables for authentication with admin
export const authContext = React.createContext(null);
export const sessionContext = React.createContext(null);

const App = () => {
  // the states for the authentication (to modify context later)
  const [session, setSession] = React.useState(null);
  const [auth, setAuth] = React.useState(null);
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
