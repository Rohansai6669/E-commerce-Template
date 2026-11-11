import { storageClient, StorageOptions } from './client';

export async function upload(options: StorageOptions) {
  return storageClient.uploadFile(options);
}
