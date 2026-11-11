import { storageClient, StorageOptions } from './client';

export async function getSignedUrl(options: Omit<StorageOptions, 'file'>, expiresIn = 3600) {
  return storageClient.createSignedUrl(options, expiresIn);
}
