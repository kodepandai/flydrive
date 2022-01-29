/**
 * @kodepandai/flydrive
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 */

import fs from 'fs-extra';
import S3 from 'aws-sdk/clients/s3';
import { NoSuchBucket, FileNotFound } from '@kodepandai/flydrive';

import { AmazonWebServicesS3Storage, AmazonWebServicesS3StorageConfig } from '../src/AmazonWebServicesS3Storage';
import { streamToString } from '../../../test/utils';

const config: AmazonWebServicesS3StorageConfig = {
	key: process.env.S3_KEY || '',
	endpoint: process.env.S3_ENDPOINT || '',
	secret: process.env.S3_SECRET || '',
	bucket: process.env.S3_BUCKET || '',
	region: process.env.S3_REGION || '',
	s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE=='true'? true: false ,

};

const storage = new AmazonWebServicesS3Storage(config);

function fileURL(KEY: string): string {
	const {S3_ENDPOINT, S3_BUCKET} = process.env
	const protocol = S3_ENDPOINT?.startsWith('https')?'https':'http';
	return `${protocol}://${(storage.driver() as S3).endpoint.host}/${S3_BUCKET}/${KEY}`;
}

const testString = 'test-data';

describe('S3 Driver', () => {
	test(`return false when file doesn't exists`, async () => {
		const { exists } = await storage.exists('some-file.jpg');
		expect(exists).toBe(false);
	});

	test('create a new file', async () => {
		await storage.put('some-file.txt', testString);

		const { content } = await storage.get('some-file.txt');
		expect(content).toStrictEqual(testString);
	});

	test('create a new file from buffer', async () => {
		await storage.put('buffer-file.txt', Buffer.from(testString, 'utf-8'));

		const { content } = await storage.get('some-file.txt');
		expect(content).toStrictEqual(testString);
	});

	test('create a new file from stream', async () => {
		const readStream = fs.createReadStream(__filename);

		await storage.put('stream-file.txt', readStream);
		const { exists } = await storage.exists('stream-file.txt');

		expect(exists).toBe(true);
	});

	test('throw exception when unable to put file', async () => {
		expect.assertions(1);

		try {
			const storage = new AmazonWebServicesS3Storage({ ...config, bucket: 'wrong' });
			await storage.put('dummy-file.txt', testString);
		} catch (error: any) {
			expect(error).toBeInstanceOf(NoSuchBucket);
		}
	});

	test('delete existing file', async () => {
		await storage.put('dummy-file.txt', testString);

		const { wasDeleted } = await storage.delete('dummy-file.txt');
		expect(wasDeleted).toBe(null);

		const { exists } = await storage.exists('dummy-file.txt');
		expect(exists).toBe(false);
	});

	test('get file contents as string', async () => {
		await storage.put('dummy-file.txt', testString);

		const { content } = await storage.get('dummy-file.txt');
		expect(content).toStrictEqual(testString);
	});

	test('get file contents as Buffer', async () => {
		await storage.put('dummy-file.txt', testString);

		const { content } = await storage.getBuffer('dummy-file.txt');
		expect(content).toBeInstanceOf(Buffer);
		expect(content.toString()).toEqual(testString);
	});

	test('get file that does not exist', async () => {
		expect.assertions(1);

		try {
			await storage.get('bad.txt');
		} catch (error: any) {
			expect(error).toBeInstanceOf(FileNotFound);
		}
	});

	test('get the stat of a file', async () => {
		await storage.put('dummy-file.txt', testString);

		const { size, modified } = await storage.getStat('dummy-file.txt');
		expect(size).toStrictEqual(testString.length);
		expect(modified).toBeInstanceOf(Date);
	});

	test('get file as stream', async () => {
		await storage.put('dummy-file.txt', testString);

		const stream = storage.getStream('dummy-file.txt');
		const content = await streamToString(stream);
		expect(content).toStrictEqual(testString);
	});

	test('get public url to a file', () => {
		const url = storage.getUrl('dummy-file1.txt');
		expect(url).toStrictEqual(fileURL('dummy-file1.txt'));
	});

	test('get public url to a file when region is not defined', () => {
		const storage = new AmazonWebServicesS3Storage({ ...config, region: undefined });
		const url = storage.getUrl('dummy-file1.txt');

		expect(url).toStrictEqual(fileURL('dummy-file1.txt'));
	});

	test('can put file with custom content type', async ()=>{
		await storage.put('dummy-image.webp', testString, {
			ContentType: 'image/webp'
		})
		const {content} = await storage.get('dummy-image.webp');
		expect(content).toStrictEqual(testString);
	})
});
