(() => {
  const API_BASE = "http://localhost:5000";
  const $ = (sel) => document.querySelector(sel);

  let selectedAvatarFile = null;


  // LOAD PROFILE

  async function loadProfileForEdit() {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load user");
        return;
      }

      const user = data.user;

      // Fill edit form
      const safeSet = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
      };
      safeSet("edit-name", user.fullName);
      safeSet("edit-email", user.email);
      safeSet("edit-bio", user.bio);
      $("#bio-count").textContent = `${(user.bio || "").length}/160`;

      const avatarUrl = user.avatar
        ? user.avatar.startsWith("http")
          ? user.avatar
          : `${API_BASE}${user.avatar}`
        : `${API_BASE}/uploads/profiles/default.png`;

      // Set avatar everywhere
      ["nav-profile-img", "sidebar-profile-img", "profile-img", "top-nav-profile-img"].forEach((id) => {
        const img = document.getElementById(id);
        if (img) {
          img.onerror = () => (img.src = `${API_BASE}/uploads/profiles/default.png`);
          img.src = avatarUrl;
        }
      });

      // Update sidebar info
      const navUsername = document.getElementById("nav-username");
      const navBio = document.getElementById("nav-bio");
      if (navUsername) navUsername.textContent = user.fullName || "User";
      if (navBio) navBio.textContent = user.bio || "";

      // Update dropdown info
      const dropdownName = document.getElementById("sidebar-name");
      const dropdownEmail = document.getElementById("sidebar-email");
      if (dropdownName) dropdownName.textContent = user.fullName || "User";
      if (dropdownEmail) dropdownEmail.textContent = user.email || "";

      // Update stats (if backend provides counts)
      const postsEl = document.querySelector(".profile-stats .stat-item:nth-child(1) strong");
      const followersEl = document.querySelector(".profile-stats .stat-item:nth-child(2) strong");
      const followingEl = document.querySelector(".profile-stats .stat-item:nth-child(3) strong");
      if (postsEl) postsEl.textContent = user.postsCount || 0;
      if (followersEl) followersEl.textContent = user.followers?.length || 0;
      if (followingEl) followingEl.textContent = user.following?.length || 0;
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }


  // AVATAR UPLOAD

  function setupAvatarUpload() {
    const avatarInput = $("#avatar-input");
    const profileImg = $("#profile-img");

    if (!avatarInput || !profileImg) return;

    avatarInput.addEventListener("change", (e) => {
      selectedAvatarFile = e.target.files[0] || null;

      if (selectedAvatarFile) {
        if (selectedAvatarFile.size > 5 * 1024 * 1024) {
          alert("File too large. Max allowed size is 5MB.");
          avatarInput.value = "";
          selectedAvatarFile = null;
          return;
        }
        profileImg.src = URL.createObjectURL(selectedAvatarFile);
      }
    });
  }


  // SAVE PROFILE

  function handleSaveProfile() {
    $("#save-profile-btn")?.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) return (window.location.href = "login.html");

      const fullName = $("#edit-name").value.trim();
      const email = $("#edit-email").value.trim();
      const bio = $("#edit-bio").value.trim();

      try {
        // Update profile info
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fullName, email, bio }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to update");
          return;
        }

        // Upload avatar
        if (selectedAvatarFile) {
          const formData = new FormData();
          formData.append("avatar", selectedAvatarFile);

          const avatarRes = await fetch(`${API_BASE}/api/users/me/avatar`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const avatarData = await avatarRes.json();

          if (avatarRes.ok) {

            const currentUser = JSON.parse(localStorage.getItem("user")) || {};
            currentUser.avatar = avatarData.avatar;
            localStorage.setItem("user", JSON.stringify(currentUser));
          } else {
            alert("Failed to upload avatar");
            return;
          }
        }

        const msg = $("#success-message");
        msg.style.display = "block";
        msg.textContent = "Profile updated successfully!";

        setTimeout(() => {
          msg.style.display = "none";
          location.reload();
        }, 1200);
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    });
  }


  // BIO COUNT

  function setupBioCount() {
    const bio = $("#edit-bio");
    const count = $("#bio-count");

    if (!bio || !count) return;

    bio.addEventListener("input", () => {
      count.textContent = `${bio.value.length}/160`;
    });
  }


  // CLOSE BTN

  function setupCloseProfile() {
    $(".close-profile")?.addEventListener("click", () => {
      window.location.href = "feed.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadProfileForEdit();
    setupAvatarUpload();
    handleSaveProfile();
    setupBioCount();
    setupCloseProfile();
  });
})();