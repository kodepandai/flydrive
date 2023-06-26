import { defineConfig } from "vitest/config";
import { config } from "dotenv";
config();
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    deps: {},
    // reporters: "verbose",
    watch: false,
  },
});
