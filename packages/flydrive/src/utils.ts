/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

import { promisify } from "util";
import { pipeline as nodePipeline } from "stream";

/**
 * Returns a boolean indication if stream param
 * is a readable stream or not.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isReadableStream(stream: any): stream is NodeJS.ReadableStream {
  return (
    stream !== null &&
    typeof stream === "object" &&
    typeof stream.pipe === "function" &&
    typeof stream._read === "function" &&
    typeof stream._readableState === "object" &&
    stream.readable !== false
  );
}

export const pipeline = promisify(nodePipeline);
