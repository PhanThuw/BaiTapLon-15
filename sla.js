let taiKhoan = JSON.parse(sessionStorage.getItem("fixflow_currentUser") || "null");
if (!taiKhoan) {
    window.location.replace("login.html");
} else {
    document.getElementById("sidebarName").textContent = taiKhoan.hoTen;
    document.getElementById("sidebarEmail").textContent = taiKhoan.email;
    document.getElementById("topName").textContent = taiKhoan.hoTen;
    document.getElementById("topEmail").textContent = taiKhoan.email;
    document.getElementById("sidebarAvatar").textContent = taiKhoan.hoTen.charAt(0).toUpperCase();
    document.getElementById("topAvatar").textContent = taiKhoan.hoTen.charAt(0).toUpperCase();
}

const tableBody = document.getElementById("slaTableBody");

function renderSlaPage() {
    let tickets = JSON.parse(localStorage.getItem("fixflow_tickets") || "[]");
    if (tickets.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-cell">Chưa có dữ liệu yêu cầu bảo trì.</td></tr>`;
        return;
    }

    let countOnTime = 0;
    let countWarning = 0;
    let countOverdue = 0;

    let html = "";
    tickets.forEach(item => {
        // Mô phỏng kiểm tra SLA dựa trên mức độ hoặc ngẫu nhiên/thời gian thực tế
        let slaStatus = "Đúng tiến độ";
        let badgeClass = "badge-completed";

        if (item.trangThai === "Hoàn thành") {
            slaStatus = "Đạt SLA";
            badgeClass = "badge-completed";
            countOnTime++;
        } else {
            // Giả lập logic SLA dựa trên mức độ ưu tiên
            if (item.mucDo === "Khẩn cấp") {
                slaStatus = "Quá hạn";
                badgeClass = "badge-danger";
                countOverdue++;
            } else if (item.mucDo === "Cao") {
                slaStatus = "Sắp đến hạn";
                badgeClass = "badge-pending";
                countWarning++;
            } else {
                slaStatus = "Đúng tiến độ";
                badgeClass = "badge-working";
                countOnTime++;
            }
        }

        html += `
            <tr>
                <td><strong>${item.ma}</strong></td>
                <td>${item.tieuDe}</td>
                <td><span class="priority-tag">${item.mucDo}</span></td>
                <td>${item.ngayTao}</td>
                <td><span class="status-badge ${badgeClass}">${slaStatus}</span></td>
                <td><a href="request-list.html" class="btn-sm" style="text-decoration: none; display:inline-block;">Chi tiết</a></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    document.getElementById("slaOnTime").textContent = countOnTime;
    document.getElementById("slaWarning").textContent = countWarning;
    document.getElementById("slaOverdue").textContent = countOverdue;
}

renderSlaPage();

// Đăng xuất
const logoutModal = document.getElementById("logoutModal");
document.getElementById("openLogout").addEventListener("click", () => logoutModal.hidden = false);
document.getElementById("closeLogout").addEventListener("click", () => logoutModal.hidden = true);
document.getElementById("cancelLogout").addEventListener("click", () => logoutModal.hidden = true);
document.getElementById("confirmLogout").addEventListener("click", () => {
    sessionStorage.removeItem("fixflow_currentUser");
    window.location.href = "login.html";
});