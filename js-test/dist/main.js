var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchTopPosts } from "./services/api";
//   id: number;
//   title: string;
//   body: string;
//   reactions: { likes: number };
// };
// export type Comment = {
//   id: number;
//   body: string;
//   postId: number;
// };
// const API_BASE = "https://dummyjson.com";
// const CONCURRENCY_LIMIT = 3;
// const TIMEOUT_MS = 4000;
// const cache = new Map<string, any>();
// async function fetchWithCache<T>(url: string): Promise<T> {
//   if (cache.has(url)) {
//     return Promise.resolve(cache.get(url));
//   }
//   const data = await fetchWithTimeout<T>(url);
//   cache.set(url, data);
//   return data;
// }
// async function fetchWithTimeout<T>(
//   url: string,
//   timeout: number = TIMEOUT_MS,
//   retries: number = 2
// ): Promise<T> {
//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       return await Promise.race([
//         fetch(url).then((res) => {
//           if (!res.ok) throw new Error(`HTTP error ${res.status}`);
//           return res.json();
//         }),
//         new Promise<never>((_, reject) =>
//           setTimeout(
//             () => reject(new Error(`Timeout after ${timeout}ms`)),
//             timeout
//           )
//         ),
//       ]);
//     } catch (err) {
//       console.warn(
//         `Attempt ${attempt + 1} failed for ${url}:`,
//         (err as Error).message
//       );
//       if (attempt === retries) throw err;
//       await new Promise((res) => setTimeout(res, 500));
//     }
//   }
//   throw new Error(`Failed to fetch ${url}`);
// }
// function throttleAll<T>(
//   tasks: (() => Promise<T>)[],
//   concurrency: number
// ): Promise<T[]> {
//   let index = 0;
//   const results: T[] = [];
//   let active = 0;
//   return new Promise((resolve) => {
//     const runNext = () => {
//       if (index >= tasks.length && active === 0) {
//         resolve(results);
//         return;
//       }
//       while (active < concurrency && index < tasks.length) {
//         const currentIndex = index++;
//         const task = tasks[currentIndex];
//         active++;
//         task()
//           .then((result) => {
//             results[currentIndex] = result;
//           })
//           .catch((err) => {
//             console.error(`Task ${currentIndex} failed:`, err);
//             results[currentIndex] = null as unknown as T;
//           })
//           .finally(() => {
//             active--;
//             runNext();
//           });
//       }
//     };
//     runNext();
//   });
// }
// async function getTopPosts(): Promise<Post[]> {
//   const postsData = await fetchWithCache<{ posts: Post[] }>(
//     `${API_BASE}/posts`
//   );
//   const sorted = postsData.posts.sort(
//     (a, b) => b.reactions.likes - a.reactions.likes
//   );
//   return sorted.slice(0, 5);
// }
// async function fetchPostDetails(postId: number): Promise<PostWithComments> {
//   const post = await fetchWithCache<Post>(`${API_BASE}/posts/${postId}`);
//   const commentsData = await fetchWithCache<{ comments: Comment[] }>(
//     `${API_BASE}/comments/post/${postId}`
//   );
//   return { post, comments: commentsData.comments };
// }
function renderPosts(postsWithComments) {
    const container = document.getElementById("app");
    if (!container)
        return;
    container.innerHTML = "";
    postsWithComments.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <strong>Reactions: ${post.reactions.likes}</strong>
      <h4>Comments:</h4>
      <ul>
        ${post.comments.map((c) => `<li>${c.body}</li>`).join("")}
      </ul>
    `;
        container.appendChild(postDiv);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topPosts = yield fetchTopPosts(5);
            // const tasks = topPosts.map((post) => () => fetchPostDetail(post.id));
            // const postsWithComments = await fetchPostComments(post.id);
            renderPosts(topPosts);
        }
        catch (err) {
            console.error("Failed to load content:", err);
            const container = document.getElementById("app");
            if (container)
                container.textContent = "Something went wrong.";
        }
    });
}
main();
