/* ===================================================
   FIXFLOW - QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (JS)
=================================================== */

document.addEventListener("DOMContentLoaded", function() {
    const userTableBody = document.getElementById("userTableBody");
    const searchUser = document.getElementById("searchUser");
    const roleFilter = document.getElementById("roleFilter");
    
    const userModal = document.getElementById("userModal");
    const userForm = document.getElementById("userForm");
    const userModalTitle = document.getElementById("userModalTitle");
    const modalName = document.getElementById("modalName");
    const modalEmail = document.getElementById("modalEmail");
    const modalRole = document.getElementById("modalRole");
    const editingEmail = document.getElementById("editingEmail");

    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem("fixflow_currentUser") || "null");
    } catch(e) {
        currentUser = null;
    }

    if (!currentUser) {
        window.location.replace("login.html");
        return;
    }

    // Hiển thị thông tin người dùng đang đăng nhập
    const hoTen = currentUser.hoTen || "Quản trị viên";
    const email = currentUser.email || "admin@fixflow.com";
    document.getElementById("sidebarName").textContent = hoTen;
    document.getElementById("sidebarEmail").textContent = email;
    document.getElementById("topName").textContent = hoTen;
    document.getElementById("topEmail").textContent = email;
    const initial = hoTen.charAt(0).toUpperCase();
    document.getElementById("sidebarAvatar").textContent = initial;
    document.getElementById("topAvatar").textContent = initial;

    function layDanhSachUsers() {
        try {
            let list = JSON.parse(localStorage.getItem("fixflow_users") || "[]");
            if (!Array.isArray(list) || list.length === 0) {
                list = [
                    { hoTen: "Trần Bảo Trân", email: "khanhtrankvt@gmail.com", vaiTro: "Quản trị viên", trangThai: "Hoạt động" },
                    { hoTen: "Nguyễn Văn Kỹ Thuật", email: "tech@fixflow.com", vaiTro: "Kỹ thuật viên", trangThai: "Hoạt động" },
                    { hoTen: "Lê Quản Lý", email: "manager@fixflow.com", vaiTro: "Quản lý bảo trì", trangThai: "Hoạt động" },
                    { hoTen: "Phạm Người Dùng", email: "user@email.com", vaiTro: "Người yêu cầu", trangThai: "Hoạt động" }
                ];
                localStorage.setItem("fixflow_users", JSON.stringify(list));
            }
            return list;
        } catch(e) {
            return [];
        }
    }

    function renderUsers() {
        const users = layDanhSachUsers();
        const keyword = searchUser.value.trim().toLowerCase();
        const roleVal = roleFilter.value;

        const filtered = users.filter(u => {
            const matchText = (u.hoTen + " " + u.email).toLowerCase().includes(keyword);
            const matchRole = !roleVal || (u.vaiTro || "Người yêu cầu") === roleVal;
            return matchText && matchRole;
        });

        if (filtered.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="5" class="empty-cell">Không tìm thấy người dùng phù hợp.</td></tr>`;
            return;
        }

        userTableBody.innerHTML = filtered.map(u => `
            <tr>
                <td><b>${escapeHtml(u.hoTen || "—")}</b></td>
                <td>${escapeHtml(u.email || "—")}</td>
                <td><span class="ticket-status working">${escapeHtml(u.vaiTro || "Người yêu cầu")}</span></td>
                <td><span class="ticket-status done">${escapeHtml(u.trangThai || "Hoạt động")}</span></td>
                <td>
                    <div class="user-action-btns">
                        <button class="request-view-btn" type="button" onclick="window.editUserRecord('${u.email}')">Sửa</button>
                        <button class="request-view-btn" type="button" style="background:#ffebeb; color:#dc3e48;" onclick="window.deleteUserRecord('${u.email}')">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : String(str);
        return div.innerHTML;
    }

    window.editUserRecord = function(email) {
        const users = layDanhSachUsers();
        const u = users.find(x => x.email === email);
        if(!u) return;
        userModalTitle.textContent = "Chỉnh sửa người dùng";
        modalName.value = u.hoTen;
        modalEmail.value = u.email;
        modalEmail.disabled = true;
        modalRole.value = u.vaiTro || "Người yêu cầu";
        editingEmail.value = u.email;
        userModal.classList.add("show");
    }

    window.deleteUserRecord = function(email) {
        if(confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
            let users = layDanhSachUsers();
            users = users.filter(x => x.email !== email);
            localStorage.setItem("fixflow_users", JSON.stringify(users));
            renderUsers();
        }
    }

    document.getElementById("openAddUserModal").addEventListener("click", () => {
        userModalTitle.textContent = "Thêm tài khoản mới";
        userForm.reset();
        modalEmail.disabled = false;
        editingEmail.value = "";
        userModal.classList.add("show");
    });

    document.getElementById("closeUserModal").addEventListener("click", () => userModal.classList.remove("show"));
    document.getElementById("cancelUserModal").addEventListener("click", () => userModal.classList.remove("show"));

    userForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let users = layDanhSachUsers();
        const emailVal = modalEmail.value.trim().toLowerCase();
        const nameVal = modalName.value.trim();
        const roleVal = modalRole.value;

        if(editingEmail.value) {
            const idx = users.findIndex(x => x.email === editingEmail.value);
            if(idx !== -1) {
                users[idx].hoTen = nameVal;
                users[idx].vaiTro = roleVal;
            }
        } else {
            if(users.some(x => x.email === emailVal)) {
                alert("Email này đã tồn tại trong hệ thống!");
                return;
            }
            users.push({ hoTen: nameVal, email: emailVal, vaiTro: roleVal, trangThai: "Hoạt động", matKhau: "123456" });
        }

        localStorage.setItem("fixflow_users", JSON.stringify(users));
        userModal.classList.remove("show");
        renderUsers();
    });

    searchUser.addEventListener("input", renderUsers);
    roleFilter.addEventListener("change", renderUsers);

    document.getElementById("openLogout").addEventListener("click", () => {
        if(confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            sessionStorage.removeItem("fixflow_currentUser");
            window.location.href = "login.html";
        }
    });

    renderUsers();
});