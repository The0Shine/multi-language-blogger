document.addEventListener("DOMContentLoaded", function () {
  // Character count for bio

  // Character count for names
  setupCharacterCount("firstName", 25);
  setupCharacterCount("lastName", 25);

  function setupCharacterCount(inputId, maxCount) {
    const input = document.getElementById(inputId);
    const container = input.parentElement;

    function updateCount() {
      const count = input.value.length;

      let countElement = container.querySelector(".char-count");
      if (!countElement) {
        countElement = document.createElement("p");
        countElement.className = "char-count text-sm mt-1";
        container.appendChild(countElement);
      }

      countElement.textContent = `${count}/${maxCount} characters`;
      countElement.className = `char-count text-sm mt-1 ${
        count > maxCount ? "text-red-500" : "text-gray-500"
      }`;
    }

    input.addEventListener("input", updateCount);
    updateCount(); // Initial count
  }

  // Password strength checker
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordStrength = document.getElementById("passwordStrength");
  const passwordHelp = document.getElementById("passwordHelp");
  const passwordMatch = document.getElementById("passwordMatch");

  newPasswordInput.addEventListener("input", function () {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    updatePasswordStrength(strength, password);
    checkPasswordMatch();
  });

  confirmPasswordInput.addEventListener("input", checkPasswordMatch);

  function checkPasswordStrength(password) {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;
    return { score, checks };
  }

  function updatePasswordStrength(strength, password) {
    if (!password) {
      passwordStrength.className = "password-strength";
      passwordHelp.textContent =
        "Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.";
      passwordHelp.className = "text-sm text-gray-500 mt-2";
      return;
    }

    const { score, checks } = strength;
    let strengthClass = "";
    let strengthText = "";
    let textClass = "text-sm mt-2";

    if (score < 3) {
      strengthClass = "password-strength strength-weak";
      strengthText = "Weak password";
      textClass += " text-red-500";
    } else if (score < 4) {
      strengthClass = "password-strength strength-fair";
      strengthText = "Fair password";
      textClass += " text-yellow-500";
    } else if (score < 5) {
      strengthClass = "password-strength strength-good";
      strengthText = "Good password";
      textClass += " text-blue-500";
    } else {
      strengthClass = "password-strength strength-strong";
      strengthText = "Strong password";
      textClass += " text-green-500";
    }

    passwordStrength.className = strengthClass;
    passwordHelp.textContent = strengthText;
    passwordHelp.className = textClass;
  }

  function checkPasswordMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
      passwordMatch.textContent = "";
      return;
    }

    if (newPassword === confirmPassword) {
      passwordMatch.textContent = "✓ Passwords match";
      passwordMatch.className = "text-sm mt-1 text-green-500";
    } else {
      passwordMatch.textContent = "✗ Passwords do not match";
      passwordMatch.className = "text-sm mt-1 text-red-500";
    }
  }

  function validatePasswordChange(
    currentPassword,
    newPassword,
    confirmPassword
  ) {
    if (!currentPassword) {
      alert("Please enter your current password");
      return false;
    }

    const strength = checkPasswordStrength(newPassword);
    if (strength.score < 3) {
      alert("Please choose a stronger password");
      return false;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return false;
    }

    return true;
  }

  // Photo upload simulation
});

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + "Icon");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}
