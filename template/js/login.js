document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const password = document.getElementById("password");
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
  });

// Form submission
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = "Signing In...";
    loadingSpinner.classList.remove("hidden");
    errorMessage.classList.add("hidden");

    const formData = new FormData(this);
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Store token
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Redirect to dashboard
        window.location.href = "/dashboard.html";
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      errorText.textContent = error.message;
      errorMessage.classList.remove("hidden");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitText.textContent = "Sign In";
      loadingSpinner.classList.add("hidden");
    }
  });
