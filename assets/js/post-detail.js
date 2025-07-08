// Handle comment interactions
document.addEventListener("DOMContentLoaded", function () {
  // Handle clap buttons
  const clapButtons = document.querySelectorAll(
    "button:has(.fa-hands-clapping)"
  );
  clapButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const countSpan = this.querySelector("span");
      if (countSpan) {
        let count = parseInt(countSpan.textContent.replace("K", "000"));
        count += 1;
        countSpan.textContent =
          count > 999 ? (count / 1000).toFixed(1) + "K" : count;
      }
      this.classList.add("text-green-600");
    });
  });

  // Handle write button
  const writeButton = document.querySelector("button:has(.fa-pen)");
  if (writeButton) {
    writeButton.addEventListener("click", function () {
      window.location.href = "write.html";
    });
  }
});
