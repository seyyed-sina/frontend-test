var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createCache } from "./cache";
import { createApiThrottler } from "./throttler";
// API Endpoints
const BASE_URL = "https://dummyjson.com";
const ENDPOINTS = {
    POSTS: `${BASE_URL}/posts`,
    POST_DETAIL: (id) => `${BASE_URL}/posts/${id}`,
    POST_COMMENTS: (id) => `${BASE_URL}/comments/post/${id}`,
};
const TIMEOUT_MS = 4000;
const CONCURRENCY_LIMIT = 3; // Max 3 concurrent requests
// Create cache and throttled fetch instances
const cache = createCache();
const throttler = createApiThrottler(CONCURRENCY_LIMIT);
// Helper function to add timeout to fetch
const fetchWithTimeout = (url, timeoutMs = TIMEOUT_MS) => __awaiter(void 0, void 0, void 0, function* () {
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
// API request with caching, timeout and throttling
const apiRequest = (url) => __awaiter(void 0, void 0, void 0, function* () {
    // Check cache first
    const cachedData = cache.get(url);
    if (cachedData) {
        return cachedData;
    }
    // If not in cache, make throttled request with timeout
    try {
        const makeRequest = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield fetchWithTimeout(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            cache.set(url, data); // Store in cache
            return data;
        });
        return yield throttler.add(makeRequest);
    }
    catch (error) {
        console.error(`Request failed for ${url}:`, error);
        throw error;
    }
});
// API Functions
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
        // 1. Fetch all posts
        const allPosts = yield fetchAllPosts();
        // 2. Sort posts by reactions and take top 'count'
        const topPostIds = allPosts
            .sort((a, b) => b.reactions.likes - a.reactions.likes)
            .slice(0, count)
            .map((post) => post.id);
        // 3. Fetch detailed info and comments for each post
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
                // Return basic post info if details fetch fails
                const basicPost = allPosts.find((p) => p.id === postId);
                return Object.assign(Object.assign({}, basicPost), { comments: [] });
            }
        }));
        // Wait for all detailed posts to be fetched
        return yield Promise.all(detailedPostsPromises);
    }
    catch (error) {
        console.error("Error fetching top posts:", error);
        throw error;
    }
});
