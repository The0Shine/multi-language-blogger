// Simple navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("mainHeader");
  const navTabs = document.getElementById("navTabs");
  const headerHeight = header.offsetHeight;
  let lastScrollTop = 0;

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // const direction = scrollTop > lastScrollTop ? "down" : "up";

    // Tính tỉ lệ header trượt lên dần
    let translateY = Math.min(scrollTop, headerHeight);
    header.style.transform = `translateY(-${translateY}px)`;

    // NavTabs sẽ sticky ngay sau khi header ẩn dần
    navTabs.style.top = `${Math.max(headerHeight - translateY, 0)}px`;

    lastScrollTop = scrollTop;
  }

  // Throttle bằng requestAnimationFrame
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick);

  // Handle tab navigation
  const tabs = document.querySelectorAll("nav button");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => {
        t.classList.remove("border-black", "text-black", "font-medium");
        t.classList.add("text-gray-500");
      });

      this.classList.remove("text-gray-500");
      this.classList.add("border-black", "text-black", "font-medium");
    });
  });

  // Handle article clicks (optional)

  // Handle write button (optional)

  // Handle article clicks
  const articleTitles = document.querySelectorAll("h2.hover-underline");
  articleTitles.forEach((title) => {
    title.addEventListener("click", function () {
      window.location.href = "pages/post-detail.html";
    });
  });

  // Handle write button
  const writeButton = document.querySelector("button:has(.fa-pen)");
  if (writeButton) {
    writeButton.addEventListener("click", function () {
      window.location.href = "pages/write.html";
    });
  }
});
const profileDropdown = document.getElementById("profileDropdown");
const dropdownMenu = document.getElementById("dropdownMenu");

if (profileDropdown && dropdownMenu) {
  profileDropdown.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    dropdownMenu.classList.add("hidden");
  });

  // Prevent dropdown from closing when clicking inside it
  dropdownMenu.addEventListener("click", function (e) {
    e.stopPropagation();
  });
}
let scrollAmount = 200; // Amount to scroll each time

function scrollTabs(direction) {
  const container = document.getElementById("tabsContainer");
  const scrollLeft = container.scrollLeft;
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;

  if (direction === "left") {
    container.scrollLeft = Math.max(0, scrollLeft - scrollAmount);
  } else {
    container.scrollLeft = Math.min(
      scrollWidth - clientWidth,
      scrollLeft + scrollAmount
    );
  }

  // Update button visibility after scroll
  setTimeout(updateScrollButtons, 100);
}

function updateScrollButtons() {
  const container = document.getElementById("tabsContainer");
  const leftButton = document.getElementById("scrollLeft");
  const rightButton = document.getElementById("scrollRight");

  const scrollLeft = container.scrollLeft;
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;

  // Show/hide left button
  if (scrollLeft > 0) {
    leftButton.classList.remove("hidden");
    container.style.marginLeft = "40px";
  } else {
    leftButton.classList.add("hidden");
    container.style.marginLeft = "0";
  }

  // Show/hide right button
  if (scrollLeft < scrollWidth - clientWidth - 1) {
    rightButton.classList.remove("hidden");
    container.style.marginRight = "40px";
  } else {
    rightButton.classList.add("hidden");
    container.style.marginRight = "0";
  }
}

// Initial check and resize handler
function checkScrollNeeded() {
  const container = document.getElementById("tabsContainer");
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;

  if (scrollWidth > clientWidth) {
    updateScrollButtons();
  } else {
    // Hide all buttons if no scroll needed
    document.getElementById("scrollLeft").classList.add("hidden");
    document.getElementById("scrollRight").classList.add("hidden");
    container.style.marginLeft = "0";
    container.style.marginRight = "0";
  }
}

// Add scroll event listener to update buttons
document
  .getElementById("tabsContainer")
  .addEventListener("scroll", updateScrollButtons);

// Check on load and resize
window.addEventListener("load", checkScrollNeeded);
window.addEventListener("resize", checkScrollNeeded);

// Initial check
checkScrollNeeded();
