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
      <div className="flex h-full min-h-screen flex-col items-center justify-center p-2">
        <Outlet />
        <Backdoor />
      </div>
    </>
  );
}
