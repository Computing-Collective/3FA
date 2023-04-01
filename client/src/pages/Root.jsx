import React from "react";
import { HomeButton } from "../components/HomeButton.jsx";
import { Outlet } from "react-router-dom";
import { Backdoor } from "./Backdoor.jsx";

export function Root() {
  return (
    <>
      <HomeButton />
      <div className="flex flex-col">
        <Outlet />
        <Backdoor />
      </div>
    </>
  );
}
