var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createCache } from "./cache.js";
import { createApiThrottler } from "./throttler.js";
const BASE_URL = "https://dummyjson.com";
const ENDPOINTS = {
    POSTS: `${BASE_URL}/posts`,
    POST_DETAIL: (id) => `${BASE_URL}/posts/${id}`,
    POST_COMMENTS: (id) => `${BASE_URL}/comments/post/${id}`,
};
const TIMEOUT_MS = 4000;
const CONCURRENCY_LIMIT = 3;
const cache = createCache();
const throttler = createApiThrottler(CONCURRENCY_LIMIT);
const fetchWithTimeout = (url_1, ...args_1) => __awaiter(void 0, [url_1, ...args_1], void 0, function* (url, timeoutMs = TIMEOUT_MS) {
    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = yield fetch(url, { signal });
        clearTimeout(timeoutId);
        return response;
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
        }
        throw error;
    }
});
const apiRequest = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedData = cache.get(url);
    if (cachedData) {
        return cachedData;
    }
    try {
        const makeRequest = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield fetchWithTimeout(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            cache.set(url, data);
            return data;
        });
        return yield throttler.add(makeRequest);
    }
    catch (error) {
        console.error(`Request failed for ${url}:`, error);
        throw error;
    }
});
export const fetchAllPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiRequest(ENDPOINTS.POSTS);
    return response.posts;
});
export const fetchPostDetail = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield apiRequest(ENDPOINTS.POST_DETAIL(postId));
});
export const fetchPostComments = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiRequest(ENDPOINTS.POST_COMMENTS(postId));
    return response.comments;
});
export const fetchTopPosts = (count) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allPosts = yield fetchAllPosts();
        const topPostIds = allPosts
            .sort((a, b) => b.reactions.likes - a.reactions.likes)
            .slice(0, count)
            .map((post) => post.id);
        const detailedPostsPromises = topPostIds.map((postId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const [postDetail, comments] = yield Promise.all([
                    fetchPostDetail(postId),
                    fetchPostComments(postId),
                ]);
                return Object.assign(Object.assign({}, postDetail), { comments });
            }
            catch (error) {
                console.error(`Error fetching details for post ${postId}:`, error);
                const basicPost = allPosts.find((p) => p.id === postId);
                return Object.assign(Object.assign({}, basicPost), { comments: [] });
            }
        }));
        return yield Promise.all(detailedPostsPromises);
    }
    catch (error) {
        console.error("Error fetching top posts:", error);
        throw error;
    }
});
