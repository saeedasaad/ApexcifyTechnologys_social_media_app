(() => {
  const BASE_URL = "http://localhost:5000";
  const API_URL = `${BASE_URL}/api`;
  const token = localStorage.getItem("token");
  const feed = document.getElementById("feed");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  async function loadMyPosts() {
    try {
      const res = await fetch(`${API_URL}/posts/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load your posts");
        return;
      }

      feed.innerHTML = data.map((post) => createPostHTML(post)).join("");
    } catch (err) {
      console.error("Error loading my posts:", err);
    }
  }

  function safeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeForAttr(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
  }

  function createPostHTML(post) {
    const avatar = post.author?.avatar
      ? `${BASE_URL}${post.author.avatar}`
      : `${BASE_URL}/uploads/profiles/default.png`;
    const postImg = post.image ? `${BASE_URL}${post.image}` : "";
    const commentsCount = Array.isArray(post.comments)
      ? post.comments.length
      : post.commentsCount || 0;

    return `
      <div class="feed-card" id="post-${post._id}" style="margin-bottom: 20px;">
        <div class="card-content">
          <div class="card-header">
            <div class="user-info">
              <img src="${avatar}" alt="User Avatar" class="user-img" />
              <div>
                <h3>${post.author?.fullName || "Unknown User"}</h3>
                <p class="time"><i class="ri-time-line"></i> ${new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div class="header-icons">
              <i class="ri-bookmark-line"></i>
              <div class="dropdown" style="position:relative;">
                <i class="ri-more-2-fill" onclick="toggleDropdown('${post._id}')"></i>
                <ul class="dropdown-menu" id="dropdownMenu-${post._id}">
                  <li class="dropdown-item" onclick="editPostPrompt('${post._id}', '${escapeForAttr(post.text || "")}')"><i class="ri-edit-line"></i>Edit</li>
                  <li class="dropdown-item" onclick="deletePost('${post._id}')"><i class="ri-delete-bin-6-line"></i>Delete</li>
                </ul>
              </div>
            </div>
          </div>
          <p class="card-text">${safeHTML(post.text || "")}</p>
          ${postImg ? `<div class="card-image"><img src="${postImg}" alt="Post Image" /></div>` : ""}
          <div class="card-footer post-actions">
            <span onclick="likePost('${post._id}')"><i class="ri-heart-line"></i> ${post.likes?.length || 0}</span>
            <span onclick="openComments('${post._id}')"><i class="ri-message-3-line"></i> ${commentsCount}</span>
            <span onclick="sharePost('${post._id}')"><i class="ri-share-forward-line"></i></span>
          </div>
        </div>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", loadMyPosts);
})();