// Simple dropdown toggle functionality
document.addEventListener("click", function (e) {
  // Close all dropdowns when clicking outside
  if (
    !e.target.closest(".dropdown-trigger") &&
    !e.target.closest(".dropdown-menu")
  ) {
    const allDropdowns = document.querySelectorAll(".dropdown-menu");
    allDropdowns.forEach((dropdown) => {
      dropdown.classList.add("hidden");
    });
    return;
  }

  // Toggle dropdown when clicking trigger
  if (e.target.closest(".dropdown-trigger")) {
    e.preventDefault();
    const trigger = e.target.closest(".dropdown-trigger");
    const dropdown = trigger.parentElement.querySelector(".dropdown-menu");

    // Close other dropdowns first
    const allDropdowns = document.querySelectorAll(".dropdown-menu");
    allDropdowns.forEach((otherDropdown) => {
      if (otherDropdown !== dropdown) {
        otherDropdown.classList.add("hidden");
      }
    });

    // Toggle current dropdown
    dropdown.classList.toggle("hidden");
  }
});

// Close dropdown on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const allDropdowns = document.querySelectorAll(".dropdown-menu");
    allDropdowns.forEach((dropdown) => {
      dropdown.classList.add("hidden");
    });
  }
});
