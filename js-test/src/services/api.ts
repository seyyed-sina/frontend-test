import type { DetailedPost, Post } from "../types/post";
import { createCache } from "./cache";
import { createApiThrottler } from "./throttler";
import type { Comment } from "../types/post";

// API Endpoints
const BASE_URL = "https://dummyjson.com";
const ENDPOINTS = {
  POSTS: `${BASE_URL}/posts`,
  POST_DETAIL: (id: number) => `${BASE_URL}/posts/${id}`,
  POST_COMMENTS: (id: number) => `${BASE_URL}/comments/post/${id}`,
};
const TIMEOUT_MS = 4000;
const CONCURRENCY_LIMIT = 3; // Max 3 concurrent requests

// Create cache and throttled fetch instances
const cache = createCache();
const throttler = createApiThrottler(CONCURRENCY_LIMIT);

// Helper function to add timeout to fetch
const fetchWithTimeout = async (
  url: string,
  timeoutMs = TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
};

// API request with caching, timeout and throttling
const apiRequest = async <T>(url: string): Promise<T> => {
  // Check cache first
  const cachedData = cache.get(url);
  if (cachedData) {
    return cachedData as T;
  }

  // If not in cache, make throttled request with timeout
  try {
    const makeRequest = async () => {
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      cache.set(url, data); // Store in cache
      return data;
    };

    return await throttler.add(makeRequest);
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
};

// API Functions
export const fetchAllPosts = async (): Promise<Post[]> => {
  const response = await apiRequest<{ posts: Post[] }>(ENDPOINTS.POSTS);
  return response.posts;
};

export const fetchPostDetail = async (
  postId: number
): Promise<DetailedPost> => {
  return await apiRequest<DetailedPost>(ENDPOINTS.POST_DETAIL(postId));
};

export const fetchPostComments = async (postId: number): Promise<Comment[]> => {
  const response = await apiRequest<{ comments: Comment[] }>(
    ENDPOINTS.POST_COMMENTS(postId)
  );
  return response.comments;
};

export const fetchTopPosts = async (count: number): Promise<DetailedPost[]> => {
  try {
    // 1. Fetch all posts
    const allPosts = await fetchAllPosts();

    // 2. Sort posts by reactions and take top 'count'
    const topPostIds = allPosts
      .sort((a, b) => b.reactions.likes - a.reactions.likes)
      .slice(0, count)
      .map((post) => post.id);

    // 3. Fetch detailed info and comments for each post
    const detailedPostsPromises = topPostIds.map(async (postId) => {
      try {
        const [postDetail, comments] = await Promise.all([
          fetchPostDetail(postId),
          fetchPostComments(postId),
        ]);

        return {
          ...postDetail,
          comments,
        };
      } catch (error) {
        console.error(`Error fetching details for post ${postId}:`, error);
        // Return basic post info if details fetch fails
        const basicPost = allPosts.find((p) => p.id === postId);
        return {
          ...(basicPost as Post),
          comments: [],
        };
      }
    });

    // Wait for all detailed posts to be fetched
    return await Promise.all(detailedPostsPromises);
  } catch (error) {
    console.error("Error fetching top posts:", error);
    throw error;
  }
};
