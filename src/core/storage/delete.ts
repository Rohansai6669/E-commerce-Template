import { storageClient, StorageOptions } from './client';

export async function deleteAsset(options: Omit<StorageOptions, 'file'>) {
  return storageClient.deleteFile(options);
}
