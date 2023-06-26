import * as fse from 'fs-extra';
import { RuntimeException } from 'node-exceptions';
import { pipeline as pipeline$1 } from 'stream';

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class LocalFileSystemStorage extends Storage {
    private $root;
    constructor(config: LocalFileSystemStorageConfig);
    /**
     * Returns full path relative to the storage's root directory.
     */
    private _fullPath;
    /**
     * Appends content to a file.
     */
    append(location: string, content: Buffer | string): Promise<Response>;
    /**
     * Copy a file to a location.
     */
    copy(src: string, dest: string): Promise<Response>;
    /**
     * Delete existing file.
     */
    delete(location: string): Promise<DeleteResponse>;
    /**
     * Returns the driver.
     */
    driver(): typeof fse;
    /**
     * Determines if a file or folder already exists.
     */
    exists(location: string): Promise<ExistsResponse>;
    /**
     * Returns the file contents as string.
     */
    get(location: string, encoding?: string): Promise<ContentResponse<string>>;
    /**
     * Returns the file contents as Buffer.
     */
    getBuffer(location: string): Promise<ContentResponse<Buffer>>;
    /**
     * Returns file size in bytes.
     */
    getStat(location: string): Promise<StatResponse>;
    /**
     * Returns a read stream for a file location.
     */
    getStream(location: string): NodeJS.ReadableStream;
    /**
     * Move file to a new location.
     */
    move(src: string, dest: string): Promise<Response>;
    /**
     * Prepends content to a file.
     */
    prepend(location: string, content: Buffer | string): Promise<Response>;
    /**
     * Creates a new file.
     * This method will create missing directories on the fly.
     */
    put(location: string, content: Buffer | NodeJS.ReadableStream | string): Promise<Response>;
    /**
     * List files with a given prefix.
     */
    flatList(prefix?: string): AsyncIterable<FileListResponse>;
    private _flatDirIterator;
}
type LocalFileSystemStorageConfig = {
    root: string;
};

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

type StorageManagerSingleDiskConfig = {
    driver: "local";
    config: LocalFileSystemStorageConfig;
} | {
    driver: string;
    config: unknown;
};
interface StorageManagerDiskConfig {
    [key: string]: StorageManagerSingleDiskConfig;
}
interface StorageManagerConfig {
    /**
     * The default disk returned by `disk()`.
     */
    default?: string;
    disks?: StorageManagerDiskConfig;
}
interface Response {
    raw: unknown;
}
interface ExistsResponse extends Response {
    exists: boolean;
}
interface ContentResponse<ContentType> extends Response {
    content: ContentType;
}
interface SignedUrlOptions {
    /**
     * Expiration time of the URL.
     * It should be a number of seconds from now.
     * @default `900` (15 minutes)
     */
    expiry?: number;
}
interface SignedUrlResponse extends Response {
    signedUrl: string;
}
interface StatResponse extends Response {
    size: number;
    modified: Date;
}
interface FileListResponse extends Response {
    path: string;
}
interface DeleteResponse extends Response {
    wasDeleted: boolean | null;
}
interface ObjectOf<T = any> {
    [key: string]: T;
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare abstract class Storage {
    /**
     * Appends content to a file.
     *
     * Supported drivers: "local"
     */
    append(location: string, content: Buffer | string): Promise<Response>;
    /**
     * Copy a file to a location.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    copy(src: string, dest: string): Promise<Response>;
    /**
     * Delete existing file.
     * The value returned by this method will have a `wasDeleted` property that
     * can be either a boolean (`true` if a file was deleted, `false` if there was
     * no file to delete) or `null` (if no information about the file is available).
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    delete(location: string): Promise<DeleteResponse>;
    /**
     * Returns the driver.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    driver(): unknown;
    /**
     * Determines if a file or folder already exists.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    exists(location: string): Promise<ExistsResponse>;
    /**
     * Returns the file contents as a string.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    get(location: string, encoding?: string): Promise<ContentResponse<string>>;
    /**
     * Returns the file contents as a Buffer.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    getBuffer(location: string): Promise<ContentResponse<Buffer>>;
    /**
     * Returns signed url for an existing file.
     *
     * Supported drivers: "s3", "gcs"
     */
    getSignedUrl(location: string, options?: SignedUrlOptions): Promise<SignedUrlResponse>;
    /**
     * Returns file's size and modification date.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    getStat(location: string): Promise<StatResponse>;
    /**
     * Returns the stream for the given file.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    getStream(location: string): NodeJS.ReadableStream;
    /**
     * Returns url for a given key. Note this method doesn't
     * validates the existence of file or it's visibility
     * status.
     *
     * Supported drivers: "s3", "gcs"
     */
    getUrl(location: string): string;
    /**
     * Move file to a new location.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    move(src: string, dest: string): Promise<Response>;
    /**
     * Creates a new file.
     * This method will create missing directories on the fly.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    put(location: string, content: Buffer | NodeJS.ReadableStream | string, option?: ObjectOf): Promise<Response>;
    /**
     * Prepends content to a file.
     *
     * Supported drivers: "local"
     */
    prepend(location: string, content: Buffer | string): Promise<Response>;
    /**
     * List files with a given prefix.
     *
     * Supported drivers: "local", "s3", "gcs"
     */
    flatList(prefix?: string): AsyncIterable<FileListResponse>;
}
declare class StorageInstance extends Storage {
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

interface StorageConstructor<T = StorageInstance> {
    new (...args: any[]): T;
}
declare class StorageManager {
    /**
     * Default disk.
     */
    private defaultDisk;
    /**
     * Configured disks.
     */
    private disksConfig;
    /**
     * Instantiated disks.
     */
    private _disks;
    /**
     * List of available drivers.
     */
    private _drivers;
    constructor(config: StorageManagerConfig);
    /**
     * Get the instantiated disks
     */
    getDisks(): Map<string, StorageInstance>;
    /**
     * Get the registered drivers
     */
    getDrivers(): Map<string, StorageConstructor<StorageInstance>>;
    /**
     * Get a disk instance.
     */
    disk<T = StorageInstance>(name?: string): T;
    addDisk(name: string, config: StorageManagerSingleDiskConfig): void;
    /**
     * Register a custom driver.
     */
    registerDriver<T extends StorageInstance>(name: string, driver: StorageConstructor<T>): void;
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class AuthorizationRequired extends RuntimeException {
    raw: Error;
    constructor(err: Error, path: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class DriverNotSupported extends RuntimeException {
    driver: string;
    static driver(name: string): DriverNotSupported;
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class FileNotFound extends RuntimeException {
    raw: Error;
    constructor(err: Error, path: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class InvalidConfig extends RuntimeException {
    static missingDiskName(): InvalidConfig;
    static missingDiskConfig(name: string): InvalidConfig;
    static missingDiskDriver(name: string): InvalidConfig;
    static duplicateDiskName(name: string): InvalidConfig;
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class MethodNotSupported extends RuntimeException {
    constructor(name: string, driver: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class NoSuchBucket extends RuntimeException {
    raw: Error;
    constructor(err: Error, bucket: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class PermissionMissing extends RuntimeException {
    raw: Error;
    constructor(err: Error, path: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class UnknownException extends RuntimeException {
    raw: Error;
    constructor(err: Error, errorCode: string, path: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

declare class WrongKeyPath extends RuntimeException {
    raw: Error;
    constructor(err: Error, path: string);
}

/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

/**
 * Returns a boolean indication if stream param
 * is a readable stream or not.
 */
declare function isReadableStream(stream: any): stream is NodeJS.ReadableStream;
declare const pipeline: typeof pipeline$1.__promisify__;

export { AuthorizationRequired, ContentResponse, DeleteResponse, DriverNotSupported, ExistsResponse, FileListResponse, FileNotFound, InvalidConfig, LocalFileSystemStorage, LocalFileSystemStorageConfig, MethodNotSupported, NoSuchBucket, ObjectOf, PermissionMissing, Response, SignedUrlOptions, SignedUrlResponse, StatResponse, Storage, StorageManager, StorageManagerConfig, StorageManagerDiskConfig, StorageManagerSingleDiskConfig, UnknownException, WrongKeyPath, isReadableStream, pipeline };
