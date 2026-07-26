import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 项目站点 module-technical-writing-docs，部署在子路径 /module-technical-writing-docs/，base 必须设置
export default defineConfig({
  base: "/module-technical-writing-docs/",
  plugins: [react()],
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    outDir: "dist",
    target: "es2020",
    minify: "esbuild",
    cssCodeSplit: true,
    reportCompressedSize: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler")
          ) {
            return "vendor";
          }
          if (id.includes("node_modules/fuse.js")) {
            return "fuse";
          }
        },
      },
    },
  },
});
