export const createCache = (defaultTtl = 5 * 60 * 1000) => {
    const cache = new Map();
    const get = (key) => {
        const item = cache.get(key);
        if (!item)
            return null;
        if (item.expires && item.expires < Date.now()) {
            cache.delete(key);
            return null;
        }
        return item.value;
    };
    const set = (key, value, ttl = defaultTtl) => {
        const expires = ttl ? Date.now() + ttl : null;
        cache.set(key, { value, expires });
    };
    const remove = (key) => {
        cache.delete(key);
    };
    const clear = () => {
        cache.clear();
    };
    const size = () => {
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
