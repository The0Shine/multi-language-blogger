document.addEventListener("DOMContentLoaded", function () {
  // Handle story title clicks

  // Handle action buttons
  const editButtons = document.querySelectorAll('button[title="Edit"]');
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      window.location.href = "write.html";
    });
  });

  const moreButtons = document.querySelectorAll('button[title="More options"]');
  moreButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document.getElementById("actionModal").classList.remove("hidden");
    });
  });

  // Handle stats buttons
  const statsButtons = document.querySelectorAll('button[title="Stats"]');
  statsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      alert("Story statistics would be shown here");
    });
  });

  // Handle publish buttons

  // Handle delete buttons
  const deleteButtons = document.querySelectorAll('button[title="Delete"]');
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to delete this story? This action cannot be undone."
        )
      ) {
        this.closest(".story-card").remove();
      }
    });
  });

  // Filter functionality
  const filterSelect = document.querySelector("select");
  if (filterSelect) {
    filterSelect.addEventListener("change", function () {
      const filterValue = this.value;
      const stories = document.querySelectorAll(".story-card");

      stories.forEach((story) => {
        const status = story.querySelector('[class*="status-"]');
        if (filterValue === "all") {
          story.style.display = "block";
        } else if (
          filterValue === "published" &&
          status.classList.contains("status-published")
        ) {
          story.style.display = "block";
        }
      });
    });
  }

  // Search functionality
  const searchInput = document.querySelector(
    'input[placeholder="Search your stories..."]'
  );
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const stories = document.querySelectorAll(".story-card");

      stories.forEach((story) => {
        const title = story.querySelector("h3").textContent.toLowerCase();
        const content = story.querySelector("p").textContent.toLowerCase();

        if (title.includes(searchTerm) || content.includes(searchTerm)) {
          story.style.display = "block";
        } else {
          story.style.display = "none";
        }
      });
    });
  }
});

function closeModal() {
  document.getElementById("actionModal").classList.add("hidden");
}

// Close modal when clicking outside
document.getElementById("actionModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});
