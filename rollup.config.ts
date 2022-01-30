import { terser } from "rollup-plugin-terser";
import ts from "@rollup/plugin-typescript";

const production = process.env.NODE_ENV == "production";
export default [
  {
    input: "packages/flydrive/src/index.ts",
    output: {
      dir: "packages/flydrive/build",
      format: "esm",
    },
    plugins: [
      ts({
        declaration: true,
        rootDir: "packages/flydrive/src",
        outDir: "packages/flydrive/build",
        sourceMap: false,
      }),
      production && terser(),
    ],
    external: ["fs-extra", "fs", "path", "util", "stream", "node-exceptions"],
  },
];
