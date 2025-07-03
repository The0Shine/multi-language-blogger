// // Post detail page specific functionality
// document.addEventListener('DOMContentLoaded', function() {
//     // Get article ID from URL parameters
//     const urlParams = new URLSearchParams(window.location.search);
//     const articleId = urlParams.get('id');

//     console.log('Article ID:', articleId);

//     // Article engagement buttons
//     const clapBtns = document.querySelectorAll('.clap-btn, .clap-btn-large');
//     const commentBtns = document.querySelectorAll('.comment-btn, .comment-btn-large');
//     const bookmarkBtns = document.querySelectorAll('.bookmark-btn');

//     // Clap functionality
//     clapBtns.forEach(btn => {
//         btn.addEventListener('click', function() {
//             const countElement = this.querySelector('.clap-count');
//             if (countElement) {
//                 let currentCount = parseInt(countElement.textContent.replace('K', '000').replace('.', ''));
//                 currentCount += 1;

//                 // Format count back to display format
//                 if (currentCount >= 1000) {
//                     countElement.textContent = (currentCount / 1000).toFixed(1) + 'K';
//                 } else {
//                     countElement.textContent = currentCount.toString();
//                 }
//             }

//             // Visual feedback
//             this.style.color = '#1a8917';
//             setTimeout(() => {
//                 this.style.color = '';
//             }, 200);

//             if (window.MediumClone) {
//                 window.MediumClone.showNotification('Thanks for clapping! 👏', 'success');
//             }
//         });
//     });

//     // Comment functionality
//     commentBtns.forEach(btn => {
//         btn.addEventListener('click', function() {
//             alert('Comment functionality - Open comments section');
//         });
//     });

//     // Bookmark functionality
//     bookmarkBtns.forEach(btn => {
//         btn.addEventListener('click', function() {
//             const isBookmarked = this.style.color === 'green';
//             this.style.color = isBookmarked ? '' : 'green';

//             const message = isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks';
//             if (window.MediumClone) {
//                 window.MediumClone.showNotification(message, 'success');
//             }
//         });
//     });

//     // Follow buttons
//     const followBtns = document.querySelectorAll('.follow-author-btn, .follow-btn-card, .follow-publication-btn');
//     followBtns.forEach(btn => {
//         btn.addEventListener('click', function() {
//             const isFollowing = this.textContent.trim() === 'Following';

//             if (isFollowing) {
//                 this.textContent = 'Follow';
//                 this.style.background = 'transparent';
//                 this.style.color = '#1a8917';
//                 this.style.border = '1px solid #1a8917';

//                 if (window.MediumClone) {
//                     window.MediumClone.showNotification('Unfollowed successfully', 'info');
//                 }
//             } else {
//                 this.textContent = 'Following';
//                 this.style.background = '#1a8917';
//                 this.style.color = 'white';
//                 this.style.border = '1px solid #1a8917';

//                 if (window.MediumClone) {
//                     window.MediumClone.showNotification('Now following!', 'success');
//                 }
//             }
//         });
//     });

//     // Share functionality
//     const shareBtn = document.querySelector('.share-btn');
//     if (shareBtn) {
//         shareBtn.addEventListener('click', function() {
//             if (navigator.share) {
//                 navigator.share({
//                     title: document.querySelector('.article-detail-title').textContent,
//                     text: document.querySelector('.article-subtitle').textContent,
//                     url: window.location.href
//                 });
//             } else {
//                 // Fallback - copy to clipboard
//                 navigator.clipboard.writeText(window.location.href).then(() => {
//                     if (window.MediumClone) {
//                         window.MediumClone.showNotification('Link copied to clipboard!', 'success');
//                     }
//                 });
//             }
//         });
//     }

//     // Listen functionality
//     const listenBtn = document.querySelector('.listen-btn');
//     if (listenBtn) {
//         listenBtn.addEventListener('click', function() {
//             alert('Audio playback functionality - Text-to-speech feature');
//         });
//     }

//     // More options
//     const moreBtn = document.querySelector('.more-btn');
//     if (moreBtn) {
//         moreBtn.addEventListener('click', function() {
//             alert('More options menu - Report, Block, etc.');
//         });
//     }

//     // Related articles
//     const relatedArticles = document.querySelectorAll('.related-article');
//     relatedArticles.forEach(article => {
//         article.addEventListener('click', function() {
//             const title = this.querySelector('h5').textContent;
//             alert(`Navigate to related article: ${title}`);
//         });
//     });

//     // Tag clicks
//     const tags = document.querySelectorAll('.tag');
//     tags.forEach(tag => {
//         tag.addEventListener('click', function(e) {
//             e.preventDefault();
//             const tagName = this.textContent;
//             alert(`Filter articles by tag: ${tagName}`);
//         });
//     });

//     // Reading progress indicator
//     function updateReadingProgress() {
//         const article = document.querySelector('.article-body');
//         if (!article) return;

//         const articleTop = article.offsetTop;
//         const articleHeight = article.offsetHeight;
//         const windowHeight = window.innerHeight;
//         const scrollTop = window.pageYOffset;

//         const progress = Math.min(100, Math.max(0,
//             ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
//         ));

//         // You can use this progress value to show a reading progress bar
//         console.log('Reading progress:', Math.round(progress) + '%');
//     }

//     // Throttled scroll listener for reading progress
//     let ticking = false;
//     window.addEventListener('scroll', function() {
//         if (!ticking) {
//             requestAnimationFrame(function() {
//                 updateReadingProgress();
//                 ticking = false;
