import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: [
      "src/index.ts", "src/AmazonWebServiceS3Storage.ts"
    ],
    format: "esm",
    target: "es2022",
    experimentalDts: true,
    clean: true,
    minify:true,
    external: ["@kodepandai/flydrive"]
  },
  {
    entry: [
      "src/index.ts", "src/AmazonWebServiceS3Storage.ts"
    ],
    format: "cjs",
    target: "es2022",
    minify:true,
    external: ["@kodepandai/flydrive"]
  }
]);
