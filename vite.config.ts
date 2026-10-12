import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set VITE_BASE (e.g. "/Daman-Trip-Guide/") when deploying under a sub-path such as GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/",
  server: { port: 5173 },
});
