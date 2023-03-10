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
import { RequireAuth } from './hooks/RequireAuth.js'

const router = createHashRouter(
  createRoutesFromElements(
    // <Route path="/" element={<Root />}>
    <>
      <Route path="/" element={<Email/>}/>
      <Route path="/lock" element={<Lock />} />
      <Route path="vault" element={<RequireAuth><Vault/></RequireAuth>}/>
    </>
    // </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);
