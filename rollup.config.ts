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
  {
    input: "packages/flydrive-s3/src/index.ts",
    output: {
      dir: "packages/flydrive-s3/build",
      format: "esm",
    },
    plugins: [
      ts({
        declaration: true,
        rootDir: "packages/flydrive-s3/src",
        outDir: "packages/flydrive-s3/build",
        sourceMap: false,
      }),
      production && terser(),
    ],
    external: ["fs-extra", "fs", "path", "util", "stream", "node-exceptions", "aws-sdk/clients/s3.js", "@kodepandai/flydrive"],
  },
  {
    input: "packages/flydrive-gcs/src/index.ts",
    output: {
      dir: "packages/flydrive-gcs/build",
      format: "esm",
    },
    plugins: [
      ts({
        declaration: true,
        rootDir: "packages/flydrive-gcs/src",
        outDir: "packages/flydrive-gcs/build",
        sourceMap: false,
      }),
      production && terser(),
    ],
    external: ["fs-extra", "fs", "path", "util", "stream", "node-exceptions", "@google-cloud/storage", "@kodepandai/flydrive"],
  },
];
