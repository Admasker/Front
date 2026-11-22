import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "");
  return {
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: {
      proxy: {
        "/api": { target: process.env.API_PROXY_TARGET || env.API_PROXY_TARGET || "http://127.0.0.1:4000", changeOrigin: false },
      },
    },
    build: { outDir: "dist", sourcemap: false },
  };
});
