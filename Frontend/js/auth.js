const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // PASSWORD TOGGLE

  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
      icon.classList.toggle("ri-eye-line");
      icon.classList.toggle("ri-eye-off-line");
    });
  });


  // LOGIN USER

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginForm.email.value.trim(),
            password: loginForm.password.value,
          }),
        });

        const data = await res.json();
        if (!res.ok) return alert(data.message || "Login failed");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "feed.html";
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    });
  }

  // REGISTER USER

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(registerForm);
      if (fd.get("password") !== fd.get("confirmPassword"))
        return alert("Passwords do not match");

      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok) return alert(data.message || "Registration failed");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "feed.html"; // FIXED
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    });
  }
});

