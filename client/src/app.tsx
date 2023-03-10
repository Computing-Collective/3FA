import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { Routes, Route, Router, HashRouter, createHashRouter, RouterProvider, createRoutesFromElements } from "react-router-dom";
import { Lock } from "./pages/lock";
import { Root } from './pages/root';
import { Vault } from "./pages/vault";

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="lock" element={<Lock />} />
      <Route path="vault" element={<Vault />} />
    </Route>
  )
)

const App = () => {
  return (
    <RouterProvider
      router={router}
    />
  );
};

export default App;

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);
