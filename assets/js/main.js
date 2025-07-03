// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Profile dropdown functionality
  const profileBtn = document.getElementById("profileBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Handle dropdown item clicks
    const dropdownItems = dropdownMenu.querySelectorAll(".dropdown-item");
    dropdownItems.forEach((item) => {
      item.addEventListener("click", function () {
        const text = this.textContent.trim();
        console.log("Dropdown item clicked:", text);

        // Handle specific actions
        switch (text) {
          case "Profile":
            alert("Navigate to Profile page");
            break;
          case "Library":
            alert("Navigate to Library page");
            break;
          case "Stories":
            alert("Navigate to Stories page");
            break;
          case "Stats":
            alert("Navigate to Stats page");
            break;
          case "Settings":
            alert("Navigate to Settings page");
            break;
          case "Sign out":
            if (confirm("Are you sure you want to sign out?")) {
              alert("Signing out...");
            }
            break;
          default:
            alert(`${text} functionality coming soon!`);
        }

        dropdownMenu.classList.remove("show");
      });
    });
  }

  // Tab switching functionality
  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all tabs
      navTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // You can add logic here to filter content based on selected tab
      console.log("Tab switched to:", this.textContent);
    });
  });

  // Search functionality
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const articles = document.querySelectorAll(".article-card");

      articles.forEach((article) => {
        const title = article.querySelector(".article-title");
        const description = article.querySelector(".article-description");

        if (title && description) {
          const titleText = title.textContent.toLowerCase();
          const descText = description.textContent.toLowerCase();

          if (titleText.includes(searchTerm) || descText.includes(searchTerm)) {
            article.style.display = "flex";
          } else {
            article.style.display = searchTerm === "" ? "flex" : "none";
          }
        }
      });
    });
  }

  // Article click functionality
  const articleCards = document.querySelectorAll(".article-card");
  articleCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      // Don't navigate if clicking on action buttons
      if (e.target.closest(".action-btn")) {
        return;
      }

      const articleId = this.dataset.articleId;
      const title = this.querySelector(".article-title").textContent;

      console.log("Navigating to article:", title);

      // Navigate to post detail page
      window.location.href = `pages/post-detail.html?id=${articleId}`;
    });
  });

  // Action buttons functionality
  const actionButtons = document.querySelectorAll(".action-btn");
  actionButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const action = this.textContent.trim();

      switch (action) {
        case "🔖":
          this.style.color = this.style.color === "green" ? "#757575" : "green";
          console.log("Article bookmarked/unbookmarked");
          break;
        case "👏":
          this.style.color = this.style.color === "green" ? "#757575" : "green";
          console.log("Article clapped");
          break;
        case "📖":
          console.log("Reading list action");
          break;
        case "⋯":
          console.log("More options menu");
          break;
      }
    });
  });

  // Write button functionality
  const writeBtn = document.querySelector(".write-btn");
  if (writeBtn) {
    writeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Write functionality - Navigate to editor page");
    });
  }

  // Start writing button
  const startWritingBtn = document.querySelector(".start-writing-btn");
  if (startWritingBtn) {
    startWritingBtn.addEventListener("click", function () {
      alert("Start writing - Navigate to editor page");
    });
  }

  // Topic tags functionality
  const topicTags = document.querySelectorAll(".topic-tag");
  topicTags.forEach((tag) => {
    tag.addEventListener("click", function (e) {
      e.preventDefault();
      const topic = this.textContent;
      console.log("Filter by topic:", topic);
      alert(`Filter articles by topic: ${topic}`);
    });
  });

  // Staff pick titles
  const staffPickTitles = document.querySelectorAll(".staff-pick-title");
  staffPickTitles.forEach((title) => {
    title.addEventListener("click", function () {
      const titleText = this.textContent;
      console.log("Staff pick clicked:", titleText);
      alert(`Navigate to article: ${titleText}`);
    });
  });
});

// Utility functions
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#1a8917"
            : type === "error"
            ? "#d73027"
            : "#242424"
        };
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Export for use in other files
window.MediumClone = {
  showNotification,
};
