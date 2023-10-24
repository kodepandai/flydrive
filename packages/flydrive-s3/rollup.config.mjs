import { bundleTs } from "@lunoxjs/build";
import del from "rollup-plugin-delete";
export default [
  ...bundleTs(["src/index.ts"], {
    beforeBuild: [del({ targets: "dist/esm/*" })],
    declaration: process.env.NODE_ENV == "production",
    outputDir: "dist/esm",
  }),
  ...bundleTs(["src/index.ts"], {
    format: "cjs",
    beforeBuild: [del({ targets: "dist/cjs/*" })],
    outputDir: "dist/cjs",
  }),
];
