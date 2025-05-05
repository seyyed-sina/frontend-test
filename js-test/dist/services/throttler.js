export const createApiThrottler = (maxConcurrent = 3) => {
    let activeCount = 0;
    const pendingQueue = [];
    const runNext = () => {
        if (pendingQueue.length === 0 || activeCount >= maxConcurrent) {
            return;
        }
        const { fn, resolve, reject } = pendingQueue.shift();
        activeCount++;
        fn()
            .then((result) => {
            resolve(result);
            activeCount--;
            runNext();
        })
            .catch((error) => {
            reject(error);
            activeCount--;
            runNext();
        });
    };
    const add = (fn) => {
        return new Promise((resolve, reject) => {
            pendingQueue.push({ fn, resolve, reject });
            runNext();
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
