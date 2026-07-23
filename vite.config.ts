import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

// 项目站点 module-template，部署在子路径 /module-template/，base 必须设置
export default defineConfig({
  base: "/module-template/",
  plugins: [react as unknown as PluginOption],
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
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor";
            }
            if (id.includes("fuse")) {
              return "fuse";
            }
          }
        },
      },
    },
  },
});
