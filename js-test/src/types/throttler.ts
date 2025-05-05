export interface ApiThrottler {
  add: <T>(fn: () => Promise<T>) => Promise<T>;
  getPendingCount: () => number;
  getActiveCount: () => number;
}
