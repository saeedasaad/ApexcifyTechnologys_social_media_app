(() => {

  // API base URL

  const BASE_URL = "http://localhost:5000";
  const API_URL = `${BASE_URL}/api`;
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return; 
  }

  // DOM elements

  const postBtn = document.getElementById("post-btn");
  const postText = document.getElementById("post-text");
  const postImage = document.getElementById("post-image");
  const preview = document.getElementById("image-preview");
  const previewImg = document.getElementById("preview-img");
  const removeImageBtn = document.getElementById("remove-image");
  const feedContainer = document.querySelector(".feed-left");

  // User header targets
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userImageEl = document.getElementById("userImage");
  const profileLinkEl = document.getElementById("profileLink");

  // Sidebar bio
  const navBioEl = document.getElementById("nav-bio");

  // Top nav + dropdown
  const topNavImg = document.getElementById("top-nav-profile-img");
  const dropdownName = document.getElementById("sidebar-name");
  const dropdownEmail = document.getElementById("sidebar-email");


  // Image preview handler

  if (postImage) {
    postImage.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) {
        preview.style.display = "none";
        previewImg.src = "";
        return;
      }
      previewImg.src = URL.createObjectURL(file);
      preview.style.display = "block";
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener("click", () => {
      preview.style.display = "none";
      previewImg.src = "";
      if (postImage) postImage.value = "";
    });
  }

  // Fetch current user

  async function getCurrentUser() {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return null;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error("Error fetching current user:", err);
      return null;
    }
  }

  // Render current user

  function renderCurrentUser(user) {
    if (!user) return;

    if (userNameEl) userNameEl.textContent = user.fullName || "User";
    if (userEmailEl) userEmailEl.textContent = user.email || "";
    if (navBioEl) navBioEl.textContent = user.bio || "";

    const avatar = user.avatar?.startsWith("http")
      ? user.avatar
      : `${BASE_URL}${user.avatar || "/uploads/profiles/default.png"}`;

    if (userImageEl) {
      userImageEl.src = avatar;
      userImageEl.alt = user.fullName || "User Avatar";
    }
    if (profileLinkEl) profileLinkEl.href = "profile.html";
    if (topNavImg) {
      topNavImg.src = avatar;
      topNavImg.alt = user.fullName || "User Avatar";
    }
    if (dropdownName) dropdownName.textContent = user.fullName || "User";
    if (dropdownEmail) dropdownEmail.textContent = user.email || "";
  }


  // Render single post

  function createPostHTML(post) {
    const avatar = post.author?.avatar
      ? post.author.avatar.startsWith("http")
        ? post.author.avatar
        : `${BASE_URL}${post.author.avatar}`
      : `${BASE_URL}/uploads/profiles/default.png`;

    const postImg = post.image ? `${BASE_URL}${post.image}` : "";

    const commentsCount = typeof post.commentsCount === "number"
      ? post.commentsCount
      : Array.isArray(post.comments) ? post.comments.length : 0;

    return `
      <div class="feed-card" id="post-${post._id}">
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

  // Small helpers for safety in HTML
  function safeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escapeForAttr(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
  }

  // Load feed posts

  async function loadFeed() {
    try {
      const res = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        return;
      }

      // Remove old posts (except the create-post card)
      feedContainer.querySelectorAll(".feed-card:not(.create-post-card)").forEach((el) => el.remove());

      const createPostCard = feedContainer.querySelector(".create-post-card");
      const frag = document.createDocumentFragment();

      data.forEach((post) => {
        const div = document.createElement("div");
        div.className = "feed-card";
        div.innerHTML = createPostHTML(post);
        frag.appendChild(div);
      });

      // Insert once after the create post card to keep order
      createPostCard.insertAdjacentElement("afterend", frag.firstChild);
      let last = createPostCard.nextElementSibling;
      while (frag.firstChild) {
        last.insertAdjacentElement("afterend", frag.firstChild);
        last = last.nextElementSibling;
      }
    } catch (err) {
      console.error("Error loading feed:", err);
    }
  }

// Create new post

const postForm = document.getElementById("create-post-form");

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const text = postText.value.trim();
    if (!text && (!postImage.files || postImage.files.length === 0)) {
      alert("Please write something or attach an image.");
      return;
    }


    const formData = new FormData(postForm);

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Post failed");
        return;
      }

 
      const createPostCard = feedContainer.querySelector(".create-post-card");
      const div = document.createElement("div");
      div.className = "feed-card";
      div.innerHTML = createPostHTML(data);
      createPostCard.insertAdjacentElement("afterend", div);


      postForm.reset(); 
      preview.style.display = "none";
      previewImg.src = "";
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error creating post");
    }
  });
}


// Open comments under a post

window.openComments = function (postId) {
  const postCard = document.querySelector(`#post-${postId}`);
  if (!postCard) return;

  let composer = postCard.querySelector(".comment-composer");
  if (composer) {
    composer.classList.toggle("hidden");
    return;
  }

  // Create composer
  composer = document.createElement("div");
  composer.className = "comment-composer";

  const userRow = document.createElement("div");
  userRow.style.display = "flex";
  userRow.style.alignItems = "center";
  userRow.style.gap = "10px";

  const avatarImg = document.createElement("img");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  avatarImg.src = currentUser?.avatar?.startsWith("http")
    ? currentUser.avatar
    : `${BASE_URL}${currentUser?.avatar || "/uploads/profiles/default.png"}`;
  avatarImg.alt = "profile";
  avatarImg.className = "feed-user-img";

  userRow.appendChild(avatarImg);

  const textarea = document.createElement("textarea");
  textarea.className = "comment-input";
  textarea.rows = 1;
  textarea.placeholder = "Write a comment...";

  const btn = document.createElement("button");
  btn.textContent = "Comment";
  btn.className = "comment-btn";
  btn.style.display = "none"; 

  // Show button when user types
  textarea.addEventListener("input", () => {
    btn.style.display = textarea.value.trim() ? "inline-block" : "none";
  });

  // Handle submit
  btn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) {
      alert("Please write a comment");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to add comment");
        return;
      }

      textarea.value = "";
      btn.style.display = "none"; 

      const commentList = postCard.querySelector(".comment-list") || document.createElement("ul");
      commentList.className = "comment-list";

      // Build comment item
      const li = document.createElement("li");
      li.className = "comment-item";

      // Row 1: avatar + name
      const headerRow = document.createElement("div");
      headerRow.className = "comment-header";

      const commentAvatar = document.createElement("img");
      commentAvatar.src = data.author?.avatar?.startsWith("http")
        ? data.author.avatar
        : `${BASE_URL}${data.author?.avatar || "/uploads/profiles/default.png"}`;
      commentAvatar.alt = "comment-user";
      commentAvatar.className = "comment-avatar";

      const nameEl = document.createElement("span");
      nameEl.className = "comment-name";
      nameEl.textContent = data.author?.fullName || "User";

      headerRow.appendChild(commentAvatar);
      headerRow.appendChild(nameEl);

      // Row 2: text
      const textRow = document.createElement("p");
      textRow.className = "comment-text";
      textRow.textContent = data.text;

      // Row 3: actions
      const actionsRow = document.createElement("div");
      actionsRow.className = "comment-actions";
      actionsRow.innerHTML = `
        <span onclick="likeComment('${data._id}')"><i class="ri-heart-line"></i> Like</span>
        <span onclick="replyComment('${data._id}')"><i class="ri-reply-line"></i> Reply</span>
      `;

      li.appendChild(headerRow);
      li.appendChild(textRow);
      li.appendChild(actionsRow);

      commentList.appendChild(li);
      postCard.appendChild(commentList);
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Error posting comment");
    }
  });

  composer.appendChild(userRow);
  composer.appendChild(textarea);
  composer.appendChild(btn);

  postCard.appendChild(composer);
};


  // Post actions

  window.likePost = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to like");
        return;
      }
      await loadFeed();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  window.deletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete");
        return;
      }
      await loadFeed();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  window.editPostPrompt = async (postId, currentText) => {
    const newText = prompt("Edit your post:", currentText || "");
    if (newText == null) return; 
    const trimmed = newText.trim();
    if (!trimmed) {
      alert("Post cannot be empty");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to edit");
        return;
      }
      await loadFeed();
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  window.sharePost = (postId) => {
    alert(`Share functionality for post ${postId} coming soon!`);
  };

  window.toggleDropdown = (postId) => {
    const menu = document.getElementById(`dropdownMenu-${postId}`);
    if (!menu) return;
    const isVisible = menu.style.display === "block";
    document.querySelectorAll(".dropdown-menu").forEach((m) => (m.style.display = "none"));
    menu.style.display = isVisible ? "none" : "block";
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown-menu").forEach((menu) => (menu.style.display = "none"));
    }
  });

  // Init

  document.addEventListener("DOMContentLoaded", async () => {
    const user = await getCurrentUser();
    renderCurrentUser(user);
    await loadFeed();
  });
})();


// Toggle create post card

const openCreatePostBtn = document.getElementById("open-create-post");
const createPostCard = document.getElementById("create-post-card");

if (openCreatePostBtn && createPostCard) {
  openCreatePostBtn.addEventListener("click", () => {
    createPostCard.classList.toggle("hidden");
  });
}


const myPostsBtn = document.getElementById("myPostsBtn");

if (myPostsBtn) {
  myPostsBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_URL}/posts/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load your posts");
        return;
      }

      feedContainer.querySelectorAll(".feed-card:not(.create-post-card)").forEach((el) => el.remove());

      const frag = document.createDocumentFragment();
      data.forEach((post) => {
        const div = document.createElement("div");
        div.className = "feed-card";
        div.innerHTML = createPostHTML(post);
        frag.appendChild(div);
      });

      const createPostCard = feedContainer.querySelector(".create-post-card");
      createPostCard.insertAdjacentElement("afterend", frag.firstChild);
      let last = createPostCard.nextElementSibling;
      while (frag.firstChild) {
        last.insertAdjacentElement("afterend", frag.firstChild);
        last = last.nextElementSibling;
      }
    } catch (err) {
      console.error("Error loading my posts:", err);
    }
  });
}