import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageConfig } from '../config/storage';
import { logger } from '../logger';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${storageConfig.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: storageConfig.r2.accessKeyId,
    secretAccessKey: storageConfig.r2.secretAccessKey,
  },
  forcePathStyle: true,
});

export interface StorageOptions {
  bucket: string;
  path: string;
  file?: Buffer | Blob;
  contentType?: string;
}

export class StorageClient {
  private logAction(action: string, bucket: string, path: string) {
    logger.info(`[STORAGE] ${action} on ${bucket}/${path}`);
  }

  public async uploadFile(options: StorageOptions): Promise<{ success: boolean; url?: string; error?: Error }> {
    this.logAction('Upload', options.bucket, options.path);
    try {
      if (!options.file) {
        throw new Error('File body is required for upload');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any = options.file;
      if (options.file instanceof Blob) {
        const arrayBuffer = await options.file.arrayBuffer();
        body = Buffer.from(arrayBuffer);
      }

      const command = new PutObjectCommand({
        Bucket: options.bucket,
        Key: options.path,
        Body: body,
        ContentType: options.contentType,
      });

      await s3.send(command);
      const publicBase = (storageConfig.r2.publicUrl || '').replace(/\/+$/, '');
      const cleanPath = options.path.replace(/^\/+/, '');
      const url = publicBase ? `${publicBase}/${cleanPath}` : `https://${options.bucket}.r2.cloudflarestorage.com/${cleanPath}`;
      return { success: true, url };
    } catch (error) {
      logger.error('R2 upload failed:', error);
      return { success: false, error: error as Error };
    }
  }

  public async downloadFile(options: Omit<StorageOptions, 'file'>): Promise<{ success: boolean; data?: Blob; error?: Error }> {
    this.logAction('Download', options.bucket, options.path);
    try {
      const command = new GetObjectCommand({
        Bucket: options.bucket,
        Key: options.path,
      });

      const response = await s3.send(command);
      if (!response.Body) {
        throw new Error('Empty response body from R2');
      }

      const bytes = await response.Body.transformToByteArray();
      const data = new Blob([bytes as unknown as BlobPart]);
      return { success: true, data };
    } catch (error) {
      logger.error('R2 download failed:', error);
      return { success: false, error: error as Error };
    }
  }

  public async createSignedUrl(options: Omit<StorageOptions, 'file'>, expiresIn = 3600): Promise<{ success: boolean; url?: string; error?: Error }> {
    this.logAction('SignedUrl', options.bucket, `${options.path} (expiresIn: ${expiresIn}s)`);
    try {
      const command = new GetObjectCommand({
        Bucket: options.bucket,
        Key: options.path,
      });

      const url = await getSignedUrl(s3, command, { expiresIn });
      return { success: true, url };
    } catch (error) {
      logger.error('R2 signed URL generation failed:', error);
      return { success: false, error: error as Error };
    }
  }

  public async deleteFile(options: Omit<StorageOptions, 'file'>): Promise<{ success: boolean; error?: Error }> {
    this.logAction('Delete', options.bucket, options.path);
    try {
      const command = new DeleteObjectCommand({
        Bucket: options.bucket,
        Key: options.path,
      });

      await s3.send(command);
      return { success: true };
    } catch (error) {
      logger.error('R2 delete failed:', error);
      return { success: false, error: error as Error };
    }
  }
}

export const storageClient = new StorageClient();
export default storageClient;
