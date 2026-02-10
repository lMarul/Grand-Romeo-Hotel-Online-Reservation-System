import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Admin Portal - Full Administration App
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3003,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
