document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault(); // prevent default anchor behavior

            const target = link.getAttribute("href");

            // Navigate using location.href
            if (target && target.endsWith(".html")) {
                window.location.href = target;
            }
        });
    });
});
