export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

export function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceVal = source[key];
      const targetVal = target[key];
      if (isObject(sourceVal)) {
        if (!(key in target)) {
          Object.assign(output, { [key]: sourceVal });
        } else if (isObject(targetVal)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          output[key as keyof T] = deepMerge(targetVal, sourceVal) as any;
        }
      } else {
        Object.assign(output, { [key]: sourceVal });
      }
    });
  }
  return output;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}
