document.addEventListener("DOMContentLoaded", () => {
    // Nếu có hash trên URL thì load đúng section, nếu không thì load dashboard mặc định
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash) {
        document.querySelectorAll(".admin-sidebar a").forEach(l => l.classList.remove("active"));
        const activeLink = document.querySelector(`[data-section="${currentHash}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
            loadSection(currentHash);
        } else {
            loadSection("dashboard");
        }
    } else {
        loadSection("dashboard");
    }

    // Handle all elements with data-section
    document.querySelectorAll("[data-section]").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Remove active from all sidebar links
            document.querySelectorAll(".admin-sidebar a").forEach(l => l.classList.remove("active"));

            // If this is a sidebar link, add active class
            if (this.tagName === 'A') {
                this.classList.add("active");
            }

            const section = this.getAttribute("data-section");
            loadSection(section);

            // Optional: update URL hash
            history.pushState(null, "", `#${section}`);
        });
    });
});
function loadSection(section) {
    fetch(`sections/${section}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("main-content").innerHTML = html;
        })
        .catch(() => {
            document.getElementById("main-content").innerHTML = `<div class="card"><div class="card-title">Section not found.</div></div>`;
        });
}

// Simple actions for demo (called from section HTML)
function addUser() { alert('Add User clicked!'); }
function editUser(btn) { alert('Edit User: ' + btn.closest('tr').children[0].textContent); }
function deleteUser(btn) { if (confirm('Delete User: ' + btn.closest('tr').children[0].textContent + '?')) { btn.closest('tr').remove(); } }
function addPost() { alert('Add Post clicked!'); }
function editPost(btn) { alert('Edit Post: ' + btn.closest('tr').children[0].textContent); }
function deletePost(btn) { if (confirm('Delete Post: ' + btn.closest('tr').children[0].textContent + '?')) { btn.closest('tr').remove(); } }
function addRole() { alert('Add Role clicked!'); }
function editRole(btn) { alert('Edit Role: ' + btn.closest('tr').children[0].textContent); }
function deleteRole(btn) { if (confirm('Delete Role: ' + btn.closest('tr').children[0].textContent + '?')) { btn.closest('tr').remove(); } }
function addLanguage() { alert('Add Language clicked!'); }
function editLanguage(btn) { alert('Edit Language: ' + btn.closest('tr').children[0].textContent); }
function deleteLanguage(btn) { if (confirm('Delete Language: ' + btn.closest('tr').children[0].textContent + '?')) { btn.closest('tr').remove(); } }
function addCategory() { alert('Add Category clicked!'); }
function editCategory(btn) { alert('Edit Category: ' + btn.closest('tr').children[0].textContent); }
function deleteCategory(btn) { if (confirm('Delete Category: ' + btn.closest('tr').children[0].textContent + '?')) { btn.closest('tr').remove(); } }

// Dropdown toggle
function toggleDropdown(el) {
    el.parentElement.classList.toggle('show');
    document.addEventListener('click', function handler(e) {
        if (!el.parentElement.contains(e.target)) {
            el.parentElement.classList.remove('show');
            document.removeEventListener('click', handler);
        }
    });
}

function showPostDetail(title, content, el) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content; // Use innerHTML for rich content
    document.getElementById('post-modal').style.display = 'flex';
    window._currentPostRow = el.closest('tr');
}
function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
    window._currentPostRow = null;
}
function approvePostFromModal() {
    alert('Approved: ' + document.getElementById('modal-title').textContent);
    closePostModal();
}
function rejectPostFromModal() {
    alert('Rejected: ' + document.getElementById('modal-title').textContent);
    closePostModal();
}
function openUserAddForm() { document.getElementById('user-add-form').style.display = 'flex'; }
function closeUserAddForm() { document.getElementById('user-add-form').style.display = 'none'; }
function openUserEditForm(btn) { document.getElementById('user-edit-form').style.display = 'flex'; /* fill form here */ }
function closeUserEditForm() { document.getElementById('user-edit-form').style.display = 'none'; }

function openRoleAddForm() { document.getElementById('role-add-form').style.display = 'flex'; }
function closeRoleAddForm() { document.getElementById('role-add-form').style.display = 'none'; }
function openRoleEditForm(btn) { document.getElementById('role-edit-form').style.display = 'flex'; /* fill form here */ }
function closeRoleEditForm() { document.getElementById('role-edit-form').style.display = 'none'; }

function openCategoryAddForm() { document.getElementById('category-add-form').style.display = 'flex'; }
function closeCategoryAddForm() { document.getElementById('category-add-form').style.display = 'none'; }
function openCategoryEditForm(btn) { document.getElementById('category-edit-form').style.display = 'flex'; /* fill form here */ }
function closeCategoryEditForm() { document.getElementById('category-edit-form').style.display = 'none'; }

function openLanguageAddForm() { document.getElementById('language-add-form').style.display = 'flex'; }
function closeLanguageAddForm() { document.getElementById('language-add-form').style.display = 'none'; }
function openLanguageEditForm(btn) { document.getElementById('language-edit-form').style.display = 'flex'; /* fill form here */ }
function closeLanguageEditForm() { document.getElementById('language-edit-form').style.display = 'none'; }

function openPostAddForm() { document.getElementById('post-add-form').style.display = 'flex'; }
function closePostAddForm() { document.getElementById('post-add-form').style.display = 'none'; }
// function openPostEditForm(btn) { document.getElementById('post-edit-form').style.display = 'flex'; /* fill form here */ }
// function closePostEditForm() { document.getElementById('post-edit-form').style.display = 'none'; }
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const table = document.querySelector('table tbody');

    if (searchInput && statusFilter && table) {
        searchInput.addEventListener('input', () => filterTable(searchInput, statusFilter, table));
        statusFilter.addEventListener('change', () => filterTable(searchInput, statusFilter, table));
    }
});

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    searchInput.value = '';
    statusFilter.value = '';
    const table = document.querySelector('table tbody');
    filterTable(searchInput, statusFilter, table);
}

function filterTable(searchInput, statusFilter, table) {
    const keyword = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const rows = table.getElementsByTagName('tr');
    for (let row of rows) {
        const col1 = row.cells[0]?.innerText.toLowerCase() || '';
        const col2 = row.cells[1]?.innerText.toLowerCase() || '';
        const rowStatus = row.cells[2]?.innerText || '';

        const matchesKeyword = col1.includes(keyword) || col2.includes(keyword);
        const matchesStatus = !status || rowStatus === status;

        row.style.display = (matchesKeyword && matchesStatus) ? '' : 'none';
    }
}

function deleteRow(button) {
    if (confirm('Are you sure you want to delete this entry?')) {
        const row = button.closest('tr');
        row.remove();
    }
}
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('open');
}
                     