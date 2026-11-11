import { revalidateTag, revalidatePath } from 'next/cache';
import { CacheTag } from './tags';

export function revalidateCacheTag(tag: CacheTag) {
  revalidateTag(tag, 'max');
}

export function revalidateCachePath(path: string) {
  revalidatePath(path);
}
