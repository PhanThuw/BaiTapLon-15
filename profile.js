/* =========================================================
   FIXFLOW - ĐỒNG BỘ DỮ LIỆU & LƯU HỒ SƠ CÁ NHÂN
========================================================= */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Tải thông tin người dùng từ SessionStorage nếu có
    var rawUser = sessionStorage.getItem("fixflow_currentUser");
    var currUser = { hoTen: "Hương", email: "huong@gmail.com" };
    
    if (rawUser) {
        try {
            currUser = JSON.parse(rawUser);
        } catch (e) {}
    }

    var name = currUser.hoTen || "Hương";
    var email = currUser.email || "huong@gmail.com";
    var initial = name.trim().charAt(0).toUpperCase() || "H";

    // Gán dữ liệu lên Sidebar & Topbar
    fnGanElementText("sidebarName", name);
    fnGanElementText("sidebarEmail", email);
    fnGanElementText("topName", name);
    fnGanElementText("topEmail", email);
    fnGanElementText("sidebarAvatar", initial);
    fnGanElementText("topAvatar", initial);

    // Gán dữ liệu lên thẻ Hồ sơ
    fnGanElementText("profileBigAvatar", initial);
    fnGanElementText("profileCardName", name);
    fnGanElementText("profileCardEmail", email);

    // Gán sẵn vào các ô input
    var fullNameInput = document.getElementById("fullName");
    var emailUserInput = document.getElementById("emailUser");
    if (fullNameInput) fullNameInput.value = name;
    if (emailUserInput) emailUserInput.value = email;

    // 2. Xử lý khi bấm nút "Lưu thay đổi"
    var profileForm = document.getElementById("profileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", function(e) {
            e.preventDefault();
            var newName = document.getElementById("fullName").value.trim();
            var newEmail = document.getElementById("emailUser").value.trim();

            var updatedUser = {
                hoTen: newName,
                email: newEmail
            };

            sessionStorage.setItem("fixflow_currentUser", JSON.stringify(updatedUser));

            // Cập nhật lại toàn bộ giao diện ngay lập tức
            var newInitial = newName.charAt(0).toUpperCase() || "H";
            fnGanElementText("sidebarName", newName);
            fnGanElementText("sidebarEmail", newEmail);
            fnGanElementText("topName", newName);
            fnGanElementText("topEmail", newEmail);
            fnGanElementText("sidebarAvatar", newInitial);
            fnGanElementText("topAvatar", newInitial);
            fnGanElementText("profileBigAvatar", newInitial);
            fnGanElementText("profileCardName", newName);
            fnGanElementText("profileCardEmail", newEmail);

            alert("✅ Đã cập nhật hồ sơ cá nhân thành công!");
        });
    }

    // 3. Xử lý Đăng xuất
    var openLogout = document.getElementById("openLogout");
    var logoutModal = document.getElementById("logoutModal");
    var closeLogout = document.getElementById("closeLogout");
    var cancelLogout = document.getElementById("cancelLogout");
    var confirmLogout = document.getElementById("confirmLogout");

    if (openLogout && logoutModal) openLogout.onclick = function() { logoutModal.hidden = false; };
    if (closeLogout && logoutModal) closeLogout.onclick = function() { logoutModal.hidden = true; };
    if (cancelLogout && logoutModal) cancelLogout.onclick = function() { logoutModal.hidden = true; };
    if (confirmLogout) {
        confirmLogout.onclick = function() {
            sessionStorage.removeItem("fixflow_currentUser");
            window.location.href = "login.html";
        };
    }
});

function fnGanElementText(id, value) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}