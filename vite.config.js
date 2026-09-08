import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/katha-studio/" : "/",
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
});
