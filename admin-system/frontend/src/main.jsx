import React, { createContext, useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { reactLocalStorage } from "reactjs-localstorage";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { createTheme, ThemeProvider } from "@mui/material";
import { purple } from "@mui/material/colors";
import { ErrorPage } from "./pages/ErrorPage.jsx";
import { RequireAuth } from "./components/RequireAuth";

// context for auth
export const authContext = createContext(null);

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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} errorElement={<ErrorPage />} />
      <Route
        path="/home"
        element={
          // <RequireAuth>
          <Home />
          // </RequireAuth>
        }
        loader={async ({ params }) => {
          console.log("loading home");
          // return;
          const response = await fetch(
            // TODO endpoint url
            `${import.meta.env.VITE_API_ENDPOINT}/api/dashboard/`
          );
          return await response.json();
        }}
        errorElement={<ErrorPage />}
      />
    </>
  )
);

const App = () => {
  const [auth, setAuth] = useState(() => {
    reactLocalStorage.get("auth_id", null);
  });

  useEffect(() => {
    reactLocalStorage.set("auth_id", auth);
  }, [auth]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <authContext.Provider value={[auth, setAuth]}>
          <RouterProvider router={router} />
        </authContext.Provider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);
