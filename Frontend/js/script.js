
// PROFILE DROPDOWN

const profileImg = document.getElementById("top-nav-profile-img");
const dropdown = document.querySelector(".profile-dropdown");

if (profileImg && dropdown) {
  profileImg.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== profileImg) {
      dropdown.classList.remove("show");
    }
  });
}


// OPEN PROFILE PAGE

const goProfile = document.getElementById("go-profile");
if (goProfile) {
  goProfile.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}

// LOGOUT USER

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}