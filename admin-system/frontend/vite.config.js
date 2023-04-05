import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "vite-plugin-fs";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [react(), fs()],
    server: {
      cors: {
        origin: [/(localhost|127\.0\.0\.1)/, "http://192.168.137.1"],
      },
    },
  });
};
