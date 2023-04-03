import React from "react";
import { HomeButton } from "../components/HomeButton.jsx";
import { Outlet } from "react-router-dom";
import { Backdoor } from "./Backdoor.jsx";

/**
 *
* @returns the root elem, contains the Home Button
 */
export function Root() {
  return (
    <>
      <HomeButton />
      <div className="flex flex-col h-full min-h-screen justify-center p-2">
        <Outlet />
        {/* <Backdoor /> */}
      </div>
    </>
  );
}
