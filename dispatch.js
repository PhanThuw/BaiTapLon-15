
/* =========================================
   FIXFLOW - DIEU PHOI CONG VIEC
========================================= */

var currentActiveTicketMa = null;

var listTechnicians = [
    "Nguyễn Văn Kỹ Thuật (KTV 1)",
    "Trần Văn Thợ (KTV 2)",
    "Lê Văn Sửa (KTV 3)"
];

/* Lay danh sach yeu cau */
function layDanhSachYeuCau() {
    try {
        var data = JSON.parse(
            localStorage.getItem("fixflow_tickets") || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Loi doc danh sach yeu cau:", error);
        return [];
    }
}

/* Luu danh sach yeu cau */
function luuDanhSachYeuCau(list) {
    localStorage.setItem("fixflow_tickets", JSON.stringify(list));
}

/* Hien thi text */
function fnGanText(id, value) {
    var el = document.getElementById(id);

    if (el) {
        el.textContent = value || "";
    }
}

/* Thong tin tai khoan */
function capNhatTaiKhoan() {
    var user = {};

    try {
        user = JSON.parse(
            sessionStorage.getItem("fixflow_currentUser") || "{}"
        );
    } catch (error) {
        user = {};
    }

    var ten = user.hoTen || user.name || "Người dùng";
    var email = user.email || "user@email.com";
    var chuCai = ten.trim().charAt(0).toUpperCase() || "U";

    fnGanText("sidebarName", ten);
    fnGanText("sidebarEmail", email);
    fnGanText("topName", ten);
    fnGanText("topEmail", email);
    fnGanText("sidebarAvatar", chuCai);
    fnGanText("topAvatar", chuCai);
}

/* Ve lai bang dieu phoi */
function fnKichHoatDieuPhoi() {
    var listTickets = layDanhSachYeuCau();
    var tbody = document.getElementById("dispatchTableBody");

    if (!tbody) return;

    if (listTickets.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="6" class="empty-cell">' +
            'Chưa có yêu cầu nào cần điều phối.' +
            '</td></tr>';
        return;
    }

    var html = "";

    for (var i = 0; i < listTickets.length; i++) {
        var ticket = listTickets[i];

        var ma = ticket.ma || ticket.id || "";
        var tieuDe = ticket.tieuDe || ticket.title || "Chưa có tiêu đề";
        var thietBi = ticket.tenThietBi || ticket.asset || "—";
        var mucDo = ticket.mucDo || ticket.mucUuTien || ticket.priority || "Trung bình";
        var trangThai = ticket.trangThai || ticket.status || "Chờ xử lý";
        var viTri = ticket.viTri || ticket.location || "—";
        var ktv = ticket.kyThuatVien || "";

        var statusClass = "status-tag";
        var statusLower = trangThai.toLowerCase();

        if (statusLower.includes("chờ")) {
            statusClass += " status-pending";
        } else if (statusLower.includes("hoàn thành")) {
            statusClass += " status-done";
        } else if (
            statusLower.includes("đang") ||
            statusLower.includes("sửa")
        ) {
            statusClass += " status-working";
        }

        html +=
            "<tr>" +
                "<td><strong>" + escapeHTML(ma) + "</strong></td>" +

                "<td>" +
                    "<strong>" + escapeHTML(tieuDe) + "</strong><br>" +
                    "<small>" + escapeHTML(thietBi) + "</small>" +
                "</td>" +

                "<td>" + escapeHTML(mucDo) + "</td>" +

                "<td><span class='" + statusClass + "'>" +
                    escapeHTML(trangThai) +
                "</span></td>" +

                "<td>" +
                    (ktv
                        ? "👨‍🔧 " + escapeHTML(ktv)
                        : "<span style='color:#e27b17'>Chưa phân công</span>") +
                "</td>" +

                "<td>" +
                    "<button type='button' class='btn-action' " +
                    "data-ticket-ma='" + escapeHTML(ma) + "'>" +
                    (ktv ? "Đổi KTV" : "Phân công KTV") +
                    "</button>" +
                "</td>" +
            "</tr>";
    }

    tbody.innerHTML = html;

    /* Gan su kien cho cac nut phan cong */
    var buttons = tbody.querySelectorAll("[data-ticket-ma]");

    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            moModalPhanCong(this.getAttribute("data-ticket-ma"));
        });
    });
}

/* Chuyen ky tu dac biet thanh HTML an toan */
function escapeHTML(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/* Mo hop thoai phan cong */
function moModalPhanCong(maYC) {
    var list = layDanhSachYeuCau();

    var ticket = list.find(function(item) {
        return String(item.ma || item.id || "") === String(maYC);
    });

    if (!ticket) {
        alert("Không tìm thấy yêu cầu cần phân công.");
        return;
    }

    currentActiveTicketMa = maYC;

    var select = document.getElementById("selectTech");
    var modal = document.getElementById("assignModal");
    var info = document.getElementById("assignTicketInfo");

    if (!select || !modal) {
        alert("Không tìm thấy hộp thoại phân công trong HTML.");
        return;
    }

    /* Tao cac lua chon KTV */
    select.innerHTML = '<option value="">-- Chọn kỹ thuật viên --</option>';

    listTechnicians.forEach(function(tenKTV) {
        var option = document.createElement("option");
        option.value = tenKTV;
        option.textContent = tenKTV;
        select.appendChild(option);
    });

    /* Hien KTV dang duoc phan cong */
    select.value = ticket.kyThuatVien || "";

    if (info) {
        info.textContent =
            "Mã yêu cầu: " + (ticket.ma || ticket.id || "") +
            " — " + (ticket.tieuDe || ticket.title || "Yêu cầu bảo trì");
    }

    modal.hidden = false;
}

/* Xac nhan phan cong hoac doi KTV */
function xacNhanPhanCong(event) {
    event.preventDefault();

    if (!currentActiveTicketMa) {
        alert("Vui lòng chọn yêu cầu cần phân công.");
        return;
    }

    var select = document.getElementById("selectTech");
    var tenKTV = select ? select.value : "";

    if (!tenKTV) {
        alert("Vui lòng chọn kỹ thuật viên.");
        return;
    }

    var list = layDanhSachYeuCau();
    var timThay = false;

    for (var i = 0; i < list.length; i++) {
        var ticket = list[i];
        var ma = ticket.ma || ticket.id || "";

        if (String(ma) === String(currentActiveTicketMa)) {
            /* Cap nhat ky thuat vien */
            ticket.kyThuatVien = tenKTV;

            /* Neu chua xu ly thi chuyen sang dang sua chua */
            var status = (ticket.trangThai || ticket.status || "").toLowerCase();

            if (
                status === "" ||
                status.includes("chờ") ||
                status.includes("chua")
            ) {
                ticket.trangThai = "Đang sửa chữa";
            }

            timThay = true;
            break;
        }
    }

    if (!timThay) {
        alert("Không tìm thấy yêu cầu trong dữ liệu đã lưu.");
        return;
    }

    try {
        luuDanhSachYeuCau(list);
    } catch (error) {
        alert("Không lưu được dữ liệu. Vui lòng kiểm tra trình duyệt.");
        console.error(error);
        return;
    }

    var modal = document.getElementById("assignModal");

    if (modal) {
        modal.hidden = true;
    }

    currentActiveTicketMa = null;

    fnKichHoatDieuPhoi();

    alert("Đã phân công kỹ thuật viên thành công!");
}

/* Dong modal */
function dongModalPhanCong() {
    var modal = document.getElementById("assignModal");

    if (modal) {
        modal.hidden = true;
    }

    currentActiveTicketMa = null;
}

/* Khoi dong */
document.addEventListener("DOMContentLoaded", function() {
    capNhatTaiKhoan();
    fnKichHoatDieuPhoi();

    var form = document.getElementById("assignForm");

    if (form) {
        form.addEventListener("submit", xacNhanPhanCong);
    }

    var closeButton = document.getElementById("closeAssign");
    var cancelButton = document.getElementById("cancelAssign");
    var modal = document.getElementById("assignModal");

    if (closeButton) {
        closeButton.addEventListener("click", dongModalPhanCong);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", dongModalPhanCong);
    }

    if (modal) {
        modal.addEventListener("click", function(event) {
            if (event.target === modal) {
                dongModalPhanCong();
            }
        });
    }

    /* Su kien dang xuat */
    var logoutModal = document.getElementById("logoutModal");

    var openLogout = document.getElementById("openLogout");
    var closeLogout = document.getElementById("closeLogout");
    var cancelLogout = document.getElementById("cancelLogout");
    var confirmLogout = document.getElementById("confirmLogout");

    if (openLogout && logoutModal) {
        openLogout.addEventListener("click", function() {
            logoutModal.hidden = false;
        });
    }

    if (closeLogout && logoutModal) {
        closeLogout.addEventListener("click", function() {
            logoutModal.hidden = true;
        });
    }

    if (cancelLogout && logoutModal) {
        cancelLogout.addEventListener("click", function() {
            logoutModal.hidden = true;
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener("click", function() {
            sessionStorage.removeItem("fixflow_currentUser");
            window.location.href = "login.html";
        });
    }
});
