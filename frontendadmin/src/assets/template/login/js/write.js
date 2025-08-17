document.addEventListener("DOMContentLoaded", function () {
  const titleInput = document.getElementById("titleInput");
  const subtitleInput = document.getElementById("subtitleInput");
  const editorContent = document.getElementById("editorContent");
  const publishModal = document.getElementById("publishModal");
  const publishBtn = document.querySelector('button:contains("Publish")');

  // Handle placeholder for editor content
  editorContent.addEventListener("focus", function () {
    if (this.textContent.trim() === "") {
      this.innerHTML = "<p><br></p>";
    }
  });

  editorContent.addEventListener("blur", function () {
    if (this.textContent.trim() === "") {
      this.innerHTML = "";
    }
  });

  // Toolbar functionality
  document.getElementById("boldBtn").addEventListener("click", () => {
    document.execCommand("bold", false, null);
  });

  document.getElementById("italicBtn").addEventListener("click", () => {
    document.execCommand("italic", false, null);
  });

  document.getElementById("linkBtn").addEventListener("click", () => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
    }
  });

  document.getElementById("h1Btn").addEventListener("click", () => {
    document.execCommand("formatBlock", false, "h1");
  });

  document.getElementById("h2Btn").addEventListener("click", () => {
    document.execCommand("formatBlock", false, "h2");
  });

  document.getElementById("h3Btn").addEventListener("click", () => {
    document.execCommand("formatBlock", false, "h3");
  });

  document.getElementById("quoteBtn").addEventListener("click", () => {
    document.execCommand("formatBlock", false, "blockquote");
  });

  document.getElementById("codeBtn").addEventListener("click", () => {
    document.execCommand("formatBlock", false, "pre");
  });

  document.getElementById("bulletBtn").addEventListener("click", () => {
    document.execCommand("insertUnorderedList", false, null);
  });

  document.getElementById("numberedBtn").addEventListener("click", () => {
    document.execCommand("insertOrderedList", false, null);
  });

  document.getElementById("imageBtn").addEventListener("click", () => {
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      document.execCommand("insertImage", false, imageUrl);
    }
  });

  // Publish modal functionality
  const publishButton =
    document.querySelector('button:contains("Publish")') ||
    Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent.includes("Publish")
    );

  if (publishButton) {
    publishButton.addEventListener("click", function () {
      publishModal.classList.remove("hidden");
    });
  }

  document.getElementById("closeModal").addEventListener("click", function () {
    publishModal.classList.add("hidden");
  });

  document
    .getElementById("cancelPublish")
    .addEventListener("click", function () {
      publishModal.classList.add("hidden");
    });

  // Close modal when clicking outside
  publishModal.addEventListener("click", function (e) {
    if (e.target === publishModal) {
      publishModal.classList.add("hidden");
    }
  });

  // Auto-save functionality (simulated)
  let saveTimeout;
  function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      console.log("Auto-saving draft...");
      // Here you would typically save to localStorage or send to server
    }, 2000);
  }

  titleInput.addEventListener("input", autoSave);
  subtitleInput.addEventListener("input", autoSave);
  editorContent.addEventListener("input", autoSave);

  // Handle Enter key in title to move to subtitle
  titleInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      subtitleInput.focus();
    }
  });

  // Handle Enter key in subtitle to move to content
  subtitleInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      editorContent.focus();
    }
  });
});
const textarea = document.getElementById("subtitleInput");

textarea.addEventListener("input", () => {
  textarea.style.height = "auto"; // Reset trước
  textarea.style.height = textarea.scrollHeight + "px"; // Set lại theo nội dung
});

// Khởi tạo khi load
window.addEventListener("DOMContentLoaded", () => {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
});
const titleInput = document.getElementById("titleInput");

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

titleInput.addEventListener("input", () => autoResize(titleInput));

window.addEventListener("DOMContentLoaded", () => autoResize(titleInput));
