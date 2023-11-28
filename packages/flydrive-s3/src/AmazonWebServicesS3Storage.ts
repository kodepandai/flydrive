/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

import {
  S3ClientConfig,
  S3Client,
  HeadObjectCommand,
  NotFound,
  PutObjectRequest,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  GetObjectOutput,
  CopyObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { SdkStream } from "@aws-sdk/types";
import {
  Storage,
  UnknownException,
  NoSuchBucket,
  FileNotFound,
  PermissionMissing,
  SignedUrlOptions,
  Response,
  ExistsResponse,
  ContentResponse,
  SignedUrlResponse,
  StatResponse,
  FileListResponse,
  DeleteResponse,
  WrongKeyPath,
} from "@kodepandai/flydrive";
import { Buffer } from "buffer";

function handleError(err: Error, path: string, bucket: string): Error {
  switch (err.name) {
    case "NoSuchBucket":
    case "PermanentRedirect":
      return new NoSuchBucket(err, bucket);
    case "NoSuchKey":
    case "FileNotFound":
      return new FileNotFound(err, path);
    case "AllAccessDisabled":
      return new PermissionMissing(err, path);
    default:
      return new UnknownException(err, err.name, path);
  }
}

export class AmazonWebServicesS3Storage extends Storage {
  protected $driver: any;
  protected $bucket: string;

  constructor(protected $config: AmazonWebServicesS3StorageConfig) {
    super();
    this.$driver = new S3Client({
      credentials: {
        accessKeyId: $config.key,
        secretAccessKey: $config.secret,
      },
      ...$config,
    });

    this.$bucket = $config.bucket;
  }

  /**
   * Copy a file to a location.
   */
  public async copy(src: string, dest: string): Promise<Response> {
    const command = new CopyObjectCommand({
      Key: dest,
      Bucket: this.$bucket,
      CopySource: `/${this.$bucket}/${src}`,
    });

    try {
      const result = await this.$driver.send(command);
      return { raw: result };
    } catch (e: any) {
      throw handleError(e, src, this.$bucket);
    }
  }

  /**
   * Delete existing file.
   */
  public async delete(location: string): Promise<DeleteResponse> {
    const command = new DeleteObjectCommand({
      Key: location,
      Bucket: this.$bucket,
    });

    try {
      const result = await this.$driver.send(command);
      // Amazon does not inform the client if anything was deleted.
      return { raw: result, wasDeleted: null };
    } catch (e: any) {
      throw handleError(e, location, this.$bucket);
    }
  }

  /**
   * Returns the driver.
   */
  public driver(): S3Client {
    return this.$driver;
  }

  /**
   * Determines if a file or folder already exists.
   */
  public async exists(location: string): Promise<ExistsResponse> {
    const command = new HeadObjectCommand({
      Key: location,
      Bucket: this.$bucket,
    });

    try {
      const result = await this.$driver.send(command);
      return { exists: true, raw: result };
    } catch (e: any) {
      if (e instanceof NotFound) {
        return { exists: false, raw: e };
      } else {
        console.log("ixxx", e);
        throw handleError(e, location, this.$bucket);
      }
    }
  }

  /**
   * Returns the file contents.
   */
  public async get(
    location: string,
    encoding: BufferEncoding = "utf-8"
  ): Promise<ContentResponse<string>> {
    const bufferResult = await this.getBuffer(location);
    return {
      content: bufferResult.content.toString(encoding),
      raw: bufferResult.raw,
    };
  }

  private async getObject(
    location: string
  ): Promise<ContentResponse<SdkStream<GetObjectOutput["Body"]>>> {
    const command = new GetObjectCommand({
      Key: location,
      Bucket: this.$bucket,
    });

    try {
      const result = await this.$driver.send(command);
      const body = result.Body;
      if (!body) {
        throw new FileNotFound(
          new Error("GetObjectOuptput Body is empty"),
          location
        );
      }
      return { content: body, raw: result };
    } catch (e: any) {
      throw handleError(e, location, this.$bucket);
    }
  }

  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    const { content } = await this.getObject(location);
    return content as NodeJS.ReadableStream;
  }

  /**
   * Returns the file contents as Buffer.
   */
  public async getBuffer(location: string): Promise<ContentResponse<Buffer>> {
    try {
      const { content, raw } = await this.getObject(location);

      // convert stream to Buffer
      return {
        content: Buffer.from(await content.transformToByteArray()),
        raw,
      };
    } catch (e: any) {
      throw handleError(e, location, this.$bucket);
    }
  }

  /**
   * Returns signed url for an existing file
   */
  public async getSignedUrl(
    location: string,
    options: SignedUrlOptions = {}
  ): Promise<SignedUrlResponse> {
    const { expiry = 900 } = options;
    const command = new GetObjectCommand({
      Bucket: this.$bucket,
      Key: location,
    });
    try {
      const result = await getSignedUrl(this.$driver, command, {
        expiresIn: expiry,
      });
      return { signedUrl: result, raw: result };
    } catch (e: any) {
      throw handleError(e, location, this.$bucket);
    }
  }

  /**
   * Returns file's size and modification date.
   */
  public async getStat(location: string): Promise<StatResponse> {
    const command = new HeadObjectCommand({
      Key: location,
      Bucket: this.$bucket,
    });

    try {
      const result = await this.$driver.send(command);
      return {
        size: result.ContentLength as number,
        modified: result.LastModified as Date,
        raw: result,
      };
    } catch (e: any) {
      throw handleError(e, location, this.$bucket);
    }
  }

  /**
   * Returns url for a given key.
   */
  public getUrl(location: string): string {
    const {
      endpoint: configEndpoint,
      bucket,
      forcePathStyle,
      region,
    } = this.$config;
    const awsHost = region ? `s3.${region}.amazonaws.com` : "s3.amazonaws.com";
    let endpoint = (configEndpoint as string) || `https:${awsHost}`;
    endpoint = endpoint.replace(bucket, "");
    const { href, protocol, host } = new URL(endpoint);

    if (href.includes("amazonaws.com")) {
      if (!forcePathStyle) {
        return `${protocol}//${bucket}.${host}/${location}`;
      }
    }
    return `${protocol}//${host}/${bucket}/${location}`;
  }

  /**
   * Moves file from one location to another. This
   * method will call `copy` and `delete` under
   * the hood.
   */
  public async move(src: string, dest: string): Promise<Response> {
    await this.copy(src, dest);
    await this.delete(src);
    return { raw: undefined };
  }

  /**
   * Creates a new file.
   * This method will create missing directories on the fly.
   */
  public async put(
    location: string,
    content: Buffer | NodeJS.ReadableStream | string,
    option: Partial<PutObjectRequest> = {}
  ): Promise<Response> {
    const command = new PutObjectCommand({
      Key: location,
      Body: content as Buffer | string,
      Bucket: this.$bucket,
      ...option,
    });
    try {
      const result = await this.$driver.send(command);
      return { raw: result };
    } catch (e: any) {
      throw handleError(e, location, this.$bucket);
    }
  }

  /**
   * Iterate over all files in the bucket.
   */
  public async *flatList(prefix = ""): AsyncIterable<FileListResponse> {
    if (prefix.includes(".") || prefix.includes(".."))
      throw new WrongKeyPath(
        new Error('Resource name contains bad components such as ".." or ".".'),
        prefix
      );
    let continuationToken: string | undefined;
    let hasContent = true;

    const command = new ListObjectsCommand({
      Bucket: this.$bucket,
      Prefix: prefix,
      Marker: continuationToken,
      MaxKeys: 1000,
    });
    do {
      try {
        const response = await this.$driver.send(command);

        continuationToken = response.NextMarker;
        hasContent = (response.Contents?.length || 0) > 0;
        if (response.Contents && hasContent) {
          for (const file of response.Contents) {
            yield {
              raw: file,
              path: file.Key as string,
            };
          }
        }
      } catch (e: any) {
        throw handleError(e, prefix, this.$bucket);
      }
    } while (continuationToken && hasContent);
  }
}

export interface AmazonWebServicesS3StorageConfig extends S3ClientConfig {
  key: string;
  secret: string;
  bucket: string;
}
