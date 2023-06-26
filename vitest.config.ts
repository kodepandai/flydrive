import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    deps: {},
    reporters: "verbose",
  },
});
