import { bundleTs } from "@lunoxjs/build";
import del from "rollup-plugin-delete";
export default [
  ...bundleTs(["src/index.ts"], {
    beforeBuild: [del({ targets: "dist/*" })],
    declaration: process.env.NODE_ENV == "production",
  }),
];
