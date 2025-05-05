import { fetchTopPosts } from "./services/api.js";
import type { DetailedPost } from "./types/post.js";

function renderPosts(postsWithComments: DetailedPost[]) {
  const container = document.getElementById("app");
  if (!container) return;

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

async function main() {
  try {
    const topPosts = await fetchTopPosts(5);
    renderPosts(topPosts);
  } catch (err) {
    console.error("Failed to load content:", err);
    const container = document.getElementById("app");
    if (container) container.textContent = "Something went wrong.";
  }
}

main();
