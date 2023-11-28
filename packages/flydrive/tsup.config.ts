import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: [
      "src/index.ts",
      "src/exceptions/*.ts"
    ],
    format: "esm",
    target: "es2022",
    experimentalDts: true,
    clean: true,
    minify:true,
  },
  {
    entry: [
      "src/index.ts",
      "src/exceptions/*.ts"
    ],
    format: "cjs",
    target: "es2022",
    minify:true,
  }
]);
