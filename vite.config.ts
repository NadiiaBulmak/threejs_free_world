import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    minify: "esbuild",
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@config": path.resolve(__dirname, "src/config"),
      "@engine-types": path.resolve(__dirname, "src/types"),
      "@template": path.resolve(__dirname, "src/template"),
    },
  },
});
