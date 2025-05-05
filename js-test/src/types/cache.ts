export interface Cache {
  get: (key: string) => any | null;
  set: (key: string, value: any, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  size: () => number;
}

export interface CacheItem {
  value: any;
  expires: number | null;
}
