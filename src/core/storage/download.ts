import { storageClient, StorageOptions } from './client';

export async function download(options: Omit<StorageOptions, 'file'>) {
  return storageClient.downloadFile(options);
}
