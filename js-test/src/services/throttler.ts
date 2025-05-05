import type { ApiThrottler } from "../types/throttler";

export const createApiThrottler = (maxConcurrent: number = 3): ApiThrottler => {
  let activeCount = 0;
  const pendingQueue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  const tryExecuteNext = () => {
    if (pendingQueue.length === 0 || activeCount >= maxConcurrent) {
      return;
    }

    const { fn, resolve, reject } = pendingQueue.shift()!;
    activeCount++;

    fn()
      .then((result) => {
        resolve(result);
        activeCount--;
        tryExecuteNext(); // Process next in queue
      })
      .catch((error) => {
        reject(error);
        activeCount--;
        tryExecuteNext(); // Process next in queue even if this one failed
      });
  };

  const add = <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      pendingQueue.push({ fn, resolve, reject });
      tryExecuteNext(); // Try to execute immediately if possible
    });
  };

  const getPendingCount = () => pendingQueue.length;
  const getActiveCount = () => activeCount;

  return {
    add,
    getPendingCount,
    getActiveCount,
  };
};
