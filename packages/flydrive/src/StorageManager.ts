/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

import { LocalFileSystemStorage } from "./LocalFileSystemStorage";
import type { StorageInstance } from "./Storage";
import { InvalidConfig, DriverNotSupported } from "./exceptions";
import type {
  StorageManagerConfig,
  StorageManagerDiskConfig,
  StorageManagerSingleDiskConfig,
} from "./types";

interface StorageConstructor<T = StorageInstance> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

export default class StorageManager {
  /**
   * Default disk.
   */
  private defaultDisk: string | undefined;

  /**
   * Configured disks.
   */
  private disksConfig: StorageManagerDiskConfig;

  /**
   * Instantiated disks.
   */
  private _disks: Map<string, StorageInstance> = new Map();

  /**
   * List of available drivers.
   */
  private _drivers: Map<string, StorageConstructor<StorageInstance>> =
    new Map();

  constructor(config: StorageManagerConfig) {
    this.defaultDisk = config.default;
    this.disksConfig = config.disks || {};
    this.registerDriver("local", LocalFileSystemStorage);
  }

  /**
   * Get the instantiated disks
   */
  getDisks(): Map<string, StorageInstance> {
    return this._disks;
  }

  /**
   * Get the registered drivers
   */
  getDrivers(): Map<string, StorageConstructor<StorageInstance>> {
    return this._drivers;
  }

  /**
   * Get a disk instance.
   */
  disk<T = StorageInstance>(name?: string): T {
    name = name || this.defaultDisk;

    /**
     * No name is defined and neither there
     * are any defaults.
     */
    if (!name) {
      throw InvalidConfig.missingDiskName();
    }

    if (this._disks.has(name)) {
      return this._disks.get(name) as unknown as T;
    }

    const diskConfig = this.disksConfig[name];

    /**
     * Configuration for the defined disk is missing
     */
    if (!diskConfig) {
      throw InvalidConfig.missingDiskConfig(name);
    }

    /**
     * There is no driver defined on disk configuration
     */
    if (!diskConfig.driver) {
      throw InvalidConfig.missingDiskDriver(name);
    }

    const Driver = this._drivers.get(diskConfig.driver);
    if (!Driver) {
      throw DriverNotSupported.driver(diskConfig.driver);
    }

    const disk = new Driver(diskConfig.config);
    this._disks.set(name, disk);
    return disk as unknown as T;
  }

  addDisk(name: string, config: StorageManagerSingleDiskConfig): void {
    if (this.disksConfig[name]) {
      throw InvalidConfig.duplicateDiskName(name);
    }
    this.disksConfig[name] = config;
  }

  /**
   * Register a custom driver.
   */
  public registerDriver<T extends StorageInstance>(
    name: string,
    driver: StorageConstructor<T>
  ): void {
    this._drivers.set(name, driver);
  }
}
