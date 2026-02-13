import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: true,
    exclude: ["**/node_modules/**", "**/e2e/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "src/types/**",
        "src/**/*.d.ts",
        "src/test/**",
        "src/api/rest/**", // Generated API client
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Vite sometimes fails to resolve Next.js subpath exports without the .js extension.
      // next-intl imports `next/navigation`, so we pin it to the actual file path.
      "next/navigation": path.resolve(__dirname, "./node_modules/next/navigation.js"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
