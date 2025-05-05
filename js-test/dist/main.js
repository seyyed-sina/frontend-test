var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchTopPosts } from "./services/api.js";
const POST_TO_SHOW = 5;
function renderPosts(postsWithComments) {
    const container = document.getElementById("app");
    if (!container)
        return;
    container.innerHTML = "";
    postsWithComments.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900">${post.title}</h3>
            <div class="flex items-center text-red-500">
              <i data-feather="heart" class="w-5 h-5 mr-1"></i>
              <span class="text-sm font-medium">${post.reactions.likes}</span>
            </div>
          </div>

          <p class="text-gray-700 mb-4">${post.body}</p>

          <div class="flex flex-wrap gap-2 mb-4">
            ${post.tags
            .map((tag) => `
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">${tag}</span>
            `)
            .join("")}
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-gray-100">
            <div class="flex items-center text-gray-500">
              <i data-feather="message-square" class="w-5 h-5 mr-1"></i>
              <span class="text-sm">${post.comments.length} comments</span>
            </div>
            <button class="toggle-comments flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
              <span>Show comments</span>
              <i data-feather="chevron-down" class="h-4 w-4 ml-1 transition-transform arrow-icon"></i>
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-gray-50 p-6 border-t border-gray-100 comment-section hidden">
          <div class="space-y-4">
            ${post.comments.length === 0
            ? `<p class="text-gray-500 text-sm italic text-center p-4">No comments yet.</p>`
            : post.comments
                .map((comment) => {
                var _a;
                return `
                        <div class="bg-white p-4 rounded-md shadow-sm">
                          <div class="flex items-center mb-2">
                            <div class="bg-blue-100 p-1.5 rounded-full mr-2">
                              <i data-feather="user" class="h-4 w-4 text-blue-700"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-900">${((_a = comment.user) === null || _a === void 0 ? void 0 : _a.fullName) || "Anonymous"}</span>
                          </div>
                          <p class="text-gray-700 text-sm">${comment.body}</p>
                        </div>
                      `;
            })
                .join("")}
          </div>
        </div>
      </div>
    `;
        const toggleButton = postDiv.querySelector(".toggle-comments");
        const commentsSection = postDiv.querySelector(".comment-section");
        if (toggleButton && commentsSection) {
            toggleButton.addEventListener("click", () => {
                const isHidden = commentsSection.classList.toggle("hidden");
                toggleButton.querySelector("span").textContent = isHidden
                    ? "Show comments"
                    : "Hide comments";
            });
        }
        container.appendChild(postDiv);
    });
    feather.replace();
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topPosts = yield fetchTopPosts(POST_TO_SHOW);
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
