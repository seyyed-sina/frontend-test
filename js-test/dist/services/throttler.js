export const createApiThrottler = (maxConcurrent = 3) => {
    let activeCount = 0;
    const pendingQueue = [];
    const tryExecuteNext = () => {
        if (pendingQueue.length === 0 || activeCount >= maxConcurrent) {
            return;
        }
        const { fn, resolve, reject } = pendingQueue.shift();
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
    const add = (fn) => {
        return new Promise((resolve, reject) => {
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
