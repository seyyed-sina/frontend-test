import type { Cache, CacheItem } from "../types/cache.js";

export const createCache = (defaultTtl = 5 * 60 * 1000): Cache => {
  const cache = new Map<string, CacheItem>();

  // Get an item from cache
  const get = (key: string): any | null => {
    const item = cache.get(key);

    // If item doesn't exist, return null
    if (!item) return null;

    // If item has expired, remove it and return null
    if (item.expires && item.expires < Date.now()) {
      cache.delete(key);
      return null;
    }

    return item.value;
  };

  // Set an item in cache with optional TTL
  const set = (key: string, value: any, ttl: number = defaultTtl) => {
    const expires = ttl ? Date.now() + ttl : null;
    cache.set(key, { value, expires });
  };

  // Remove an item from cache
  const remove = (key: string) => {
    cache.delete(key);
  };

  // Clear all items from cache
  const clear = () => {
    cache.clear();
  };

  // Get the size of the cache
  const size = (): number => {
    return cache.size;
  };

  return {
    get,
    set,
    remove,
    clear,
    size,
  };
};
