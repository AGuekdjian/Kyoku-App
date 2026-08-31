import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/features/**/domain/**/*.ts", "src/lib/auth/**/*.ts"],
      thresholds: { lines: 70, functions: 70, branches: 65, statements: 70 },
    },
  },
});
