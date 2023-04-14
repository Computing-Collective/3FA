import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [react()],
    server: {
      cors: {
        origin: [/(localhost|127\.0\.0\.1)/, "http://192.168.137.1", "http://cpen291-24.ece.ubc.ca", "http://cpen291-24.ece.ubc.ca:443"],
      },
    },
  });
};
