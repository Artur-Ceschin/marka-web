import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
  resolve: {
    alias: {
      // mirrors tsconfig paths so @/... works in tests
      "@": path.resolve(__dirname, "./src"),
      // stub Next.js modules that don't exist in Node/jsdom
      "next/image": path.resolve(__dirname, "./src/test/mocks/next-image.tsx"),
      "next/navigation": path.resolve(__dirname, "./src/test/mocks/next-navigation.ts"),
      "next/link": path.resolve(__dirname, "./src/test/mocks/next-link.tsx"),
    },
  },
});
