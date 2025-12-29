import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
// import react from '@vitejs/plugin-react'
import { reactRouter } from "@react-router/dev/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: { "x-test-header": "foobar" },
    cors: {
      // origin: /http:\/\/localhost:\d+/,
      origin: ["http://localhost:5173", "http://localhost:8080"],
    },
  },
});
