document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const password = document.getElementById("password");
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
  });

// Password strength checker
document.getElementById("password").addEventListener("input", function () {
  const password = this.value;
  const strengthBar = document.getElementById("passwordStrength");
  const hint = document.getElementById("passwordHint");

  let strength = 0;
  let feedback = [];

  if (password.length >= 6) strength++;
  else feedback.push("at least 6 characters");

  if (/[a-z]/.test(password)) strength++;
  else feedback.push("lowercase letter");

  if (/[A-Z]/.test(password)) strength++;
  else feedback.push("uppercase letter");

  if (/\d/.test(password)) strength++;
  else feedback.push("number");

  // Update strength bar
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const widths = ["25%", "50%", "75%", "100%"];

  strengthBar.className = `password-strength ${
    colors[strength - 1] || "bg-gray-200"
  }`;
  strengthBar.style.width = widths[strength - 1] || "0%";

  // Update hint
  if (feedback.length > 0) {
    hint.textContent = `Password needs: ${feedback.join(", ")}`;
    hint.className = "mt-1 text-xs text-red-500";
  } else {
    hint.textContent = "Strong password!";
    hint.className = "mt-1 text-xs text-green-500";
  }
});

// Form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");
    const errorList = document.getElementById("errorList");

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = "Creating Account...";
    loadingSpinner.classList.remove("hidden");
    errorMessage.classList.add("hidden");

    const formData = new FormData(this);
    const data = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      username: formData.get("username"),
      password: formData.get("password"),
      password_confirmation: formData.get("password_confirmation"),
    };

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message and redirect
        alert("Account created successfully! Please sign in.");
        window.location.href = "login.html";
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (error) {
      if (error.message.includes("validation") && result.errors) {
        errorText.textContent = "Please fix the following errors:";
        errorList.innerHTML = "";
        result.errors.forEach((err) => {
          const li = document.createElement("li");
          li.textContent = err.message;
          errorList.appendChild(li);
        });
      } else {
        errorText.textContent = error.message;
        errorList.innerHTML = "";
      }
      errorMessage.classList.remove("hidden");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitText.textContent = "Create Account";
      loadingSpinner.classList.add("hidden");
    }
  });
