/* =========================================================
   FIXFLOW - ĐIỀU PHỐI CÔNG VIỆC & GỢI Ý KỸ THUẬT VIÊN
========================================================= */

var currentActiveTicketMa = null;

// Danh sách dữ liệu mẫu Kỹ thuật viên sẵn có trong hệ thống
var listTechnicians = [
    { id: "KTV01", hoTen: "Nguyễn Văn A", chuyenMon: "Hỏng hóc thiết bị", khuVực: "Tòa A", trangThai: "Đang rảnh", soDienThoai: "0912345678" },
    { id: "KTV02", hoTen: "Phạm Thị D", chuyenMon: "Lỗi mạng", khuVực: "Tòa A", trangThai: "Đang bận", soDienThoai: "0988123456" },
    { id: "KTV03", hoTen: "Trần Văn C", chuyenMon: "Điện lạnh", khuVực: "Tòa B", trangThai: "Đang rảnh", soDienThoai: "0905111222" },
    { id: "KTV04", hoTen: "Lê Hoàng Nam", chuyenMon: "Hỏng hóc thiết bị", khuVực: "Tòa C", trangThai: "Đang rảnh", soDienThoai: "0933444555" }
];

function fnGanText(id, va) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = (va !== undefined && va !== null) ? va : "";
    }
}

function fnKichHoatDieuPhoi() {
    try {
        var listTickets = [];
        var rawData = localStorage.getItem("fixflow_tickets");
        
        if (rawData) {
            try {
                listTickets = JSON.parse(rawData);
            } catch (e) {
                listTickets = [];
            }
        }

        if (!Array.isArray(listTickets) || listTickets.length === 0) {
            listTickets = [
                {
                    ma: "FF-202610191",
                    tieuDe: "Máy chiếu phòng A201 không lên nguồn",
                    tenThietBi: "Máy chiếu Panasonic A201",
                    danhMuc: "Hỏng hóc thiết bị",
                    mucDo: "Khẩn cấp",
                    viTri: "Phòng A201 - Tòa A",
                    moTa: "Giảng viên cắm cáp nguồn nhưng đèn báo không sáng.",
                    trangThai: "Chờ xử lý",
                    kyThuatVien: "",
                    nguoiTao: "Hương",
                    emailNguoiTao: "huong@gmail.com",
                    ngayTao: "19/10/2026 09:00"
                },
                {
                    ma: "FF-202610192",
                    tieuDe: "Lỗi kết nối mạng WiFi tầng 2",
                    tenThietBi: "Router Cisco Tầng 2",
                    danhMuc: "Lỗi mạng",
                    mucDo: "Cao",
                    viTri: "Hành lang Tầng 2 - Tòa A",
                    moTa: "Tín hiệu chập chờn, sinh viên không kết nối được internet.",
                    trangThai: "Đang sửa chữa",
                    kyThuatVien: "Phạm Thị D",
                    nguoiTao: "Hương",
                    emailNguoiTao: "huong@gmail.com",
                    ngayTao: "19/10/2026 08:30"
                },
                {
                    ma: "FF-202610193",
                    tieuDe: "Điều hòa phòng B102 chảy nước",
                    tenThietBi: "Điều hòa Daikin B102",
                    danhMuc: "Điện lạnh",
                    mucDo: "Trung bình",
                    viTri: "Phòng B102 - Tòa B",
                    moTa: "Máy vẫn lạnh nhưng nước ngưng chảy nhỏ giọt.",
                    trangThai: "Đã hoàn thành",
                    kyThuatVien: "Trần Văn C",
                    nguoiTao: "Hương",
                    emailNguoiTao: "huong@gmail.com",
                    ngayTao: "18/10/2026 14:15"
                }
            ];
            localStorage.setItem("fixflow_tickets", JSON.stringify(listTickets));
        }

        // Cập nhật thông tin tài khoản
        var rawUser = sessionStorage.getItem("fixflow_currentUser");
        var currUser = { hoTen: "Hương", email: "huong@gmail.com" };
        if (rawUser) {
            try { currUser = JSON.parse(rawUser); } catch (err) {}
        }

        var nameStr = currUser.hoTen || "Hương";
        var emailStr = currUser.email || "huong@gmail.com";
        var avatarChar = nameStr.trim().charAt(0).toUpperCase() || "H";

        fnGanText("sidebarName", nameStr);
        fnGanText("sidebarEmail", emailStr);
        fnGanText("topName", nameStr);
        fnGanText("topEmail", emailStr);
        fnGanText("sidebarAvatar", avatarChar);
        fnGanText("topAvatar", avatarChar);

        // Tính toán thống kê
        var cTotal = listTickets.length;
        var cUnassigned = 0;
        var cWorking = 0;
        var cDone = 0;

        for (var i = 0; i < listTickets.length; i++) {
            var item = listTickets[i];
            var st = (item.trangThai || "").toLowerCase();
            var ktv = (item.kyThuatVien || "").trim();

            if (!ktv || st.includes("chờ") || st.includes("chưa")) {
                cUnassigned++;
            } else if (st.includes("sửa") || st.includes("đang")) {
                cWorking++;
            } else if (st.includes("hoàn thành") || st.includes("xong")) {
                cDone++;
            }
        }

        fnGanText("statTotal", cTotal);
        fnGanText("statUnassigned", cUnassigned);
        fnGanText("statWorking", cWorking);
        fnGanText("statDone", cDone);

        // Lọc bảng
        var searchInput = document.getElementById("dispatchSearch");
        var filterSelect = document.getElementById("dispatchFilter");
        var kw = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var filterVal = filterSelect ? filterSelect.value : "";

        var filteredList = [];
        for (var j = 0; j < listTickets.length; j++) {
            var t = listTickets[j];
            var fullText = [t.ma, t.tieuDe, t.tenThietBi, t.viTri, t.kyThuatVien].join(" ").toLowerCase();
            var matchKW = fullText.indexOf(kw) !== -1;
            var matchFilter = true;

            if (filterVal) {
                var statusStr = (t.trangThai || "").toLowerCase();
                if (filterVal === "unassigned") {
                    matchFilter = !t.kyThuatVien || statusStr.includes("chờ");
                } else {
                    matchFilter = statusStr.indexOf(filterVal.toLowerCase()) !== -1;
                }
            }

            if (matchKW && matchFilter) {
                filteredList.push(t);
            }
        }

        // Đổ dữ liệu ra bảng
        var tbody = document.getElementById("dispatchTableBody");
        if (tbody) {
            if (filteredList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#666;">Không có yêu cầu điều phối nào phù hợp.</td></tr>';
            } else {
                var htmlRows = "";
                for (var k = 0; k < filteredList.length; k++) {
                    var tk = filteredList[k];
                    var hasKtv = Boolean(tk.kyThuatVien && tk.kyThuatVien.trim());
                    var statusClass = "status-tag";
                    var stLower = (tk.trangThai || "").toLowerCase();

                    if (stLower.includes("chờ") || stLower.includes("chưa")) statusClass = "status-pending";
                    else if (stLower.includes("sửa") || stLower.includes("đang")) statusClass = "status-working";
                    else if (stLower.includes("hoàn thành") || stLower.includes("xong")) statusClass = "status-done";

                    htmlRows += '<tr>' +
                        '<td><strong>' + (tk.ma || "") + '</strong></td>' +
                        '<td><div><strong>' + (tk.tieuDe || "") + '</strong></div><small style="color:#666;">' + (tk.tenThietBi || "") + '</small></td>' +
                        '<td><strong>' + (tk.mucDo || "Trung bình") + '</strong></td>' +
                        '<td><small>' + (tk.viTri || "—") + '</small></td>' +
                        '<td>' + (hasKtv ? ('👨‍🔧 <strong>' + tk.kyThuatVien + '</strong>') : '<span style="color:#e27b17; font-weight:500;">⚠️ Chưa phân công</span>') + '</td>' +
                        '<td><span class="' + statusClass + '">' + (tk.trangThai || "Chờ xử lý") + '</span></td>' +
                        '<td>' +
                            '<button type="button" class="btn-action" onclick="window.moModalTimKTV(\'' + tk.ma + '\')">' + (hasKtv ? "Đổi KTV" : "🔍 Tìm KTV phù hợp") + '</button>' +
                        '</td>' +
                    '</tr>';
                }
                tbody.innerHTML = htmlRows;
            }
        }

        fnGanText("dispatchResultCount", "Hiển thị " + filteredList.length + " / " + listTickets.length + " yêu cầu");

    } catch (error) {
        console.error("Lỗi điều phối:", error);
    }
}

// Mở Modal Tìm KTV phù hợp dựa vào danh mục và vị trí yêu cầu
window.moModalTimKTV = function(maYC) {
    currentActiveTicketMa = maYC;
    var list = JSON.parse(localStorage.getItem("fixflow_tickets") || "[]");
    var ticket = list.find(function(t) { return t.ma === maYC; });

    if (!ticket) return;

    var modalSub = document.getElementById("matchModalSub");
    if (modalSub) {
        modalSub.textContent = "Yêu cầu: " + ticket.tieuDe + " (Danh mục: " + (ticket.danhMuc || "Chung") + " - Vị trí: " + (ticket.viTri || "—") + ")";
    }

    var matchContainer = document.getElementById("techMatchList");
    if (matchContainer) {
        var htmlTech = "";
        listTechnicians.forEach(function(ktv) {
            var isPhuHop = ticket.danhMuc && ktv.chuyenMon.toLowerCase() === ticket.danhMuc.toLowerCase();
            htmlTech += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; background: ' + (isPhuHop ? '#f0fdf4' : '#fff') + '; border-radius: 6px; margin-bottom: 6px;">' +
                '<div>' +
                    '<strong>' + ktv.hoTen + '</strong> ' + (isPhuHop ? '<span style="background: #dcfce7; color: #166534; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">⭐ Rất phù hợp chuyên môn</span>' : '') + '<br>' +
                    '<small style="color: #64748b;">Chuyên môn: ' + ktv.chuyenMon + ' | Khu vực: ' + ktv.kuVực + ' | SĐT: ' + ktv.soDienThoai + '</small>' +
                '</div>' +
                '<button type="button" class="btn-action" onclick="window.chonGiaoKTV(\'' + ktv.hoTen + '\')">Giao việc</button>' +
            '</div>';
        });
        matchContainer.innerHTML = htmlTech;
    }

    var modal = document.getElementById("techMatchModal");
    if (modal) modal.hidden = false;
};

// Chọn kỹ thuật viên từ danh sách gợi ý để gán vào yêu cầu
window.chonGiaoKTV = function(tenKTV) {
    if (!currentActiveTicketMa) return;
    
    var list = JSON.parse(localStorage.getItem("fixflow_tickets") || "[]");
    for (var i = 0; i < list.length; i++) {
        if (list[i].ma === currentActiveTicketMa) {
            list[i].kyThuatVien = tenKTV;
            if ((list[i].trangThai || "").toLowerCase().includes("chờ")) {
                list[i].trangThai = "Đang sửa chữa";
            }
            break;
        }
    }

    localStorage.setItem("fixflow_tickets", JSON.stringify(list));
    
    var modal = document.getElementById("techMatchModal");
    if (modal) modal.hidden = true;

    fnKichHoatDieuPhoi();
    alert("✅ Đã phân công thành công cho kỹ thuật viên: " + tenKTV);
};

// Đăng ký sự kiện khởi chạy & Đóng mở modal
document.addEventListener("DOMContentLoaded", function() {
    fnKichHoatDieuPhoi();

    var searchInput = document.getElementById("dispatchSearch");
    var filterSelect = document.getElementById("dispatchFilter");
    if (searchInput) searchInput.addEventListener("input", fnKichHoatDieuPhoi);
    if (filterSelect) filterSelect.addEventListener("change", fnKichHoatDieuPhoi);

    var closeTechModal = document.getElementById("closeTechModal");
    var cancelTechModal = document.getElementById("cancelTechModal");
    var techMatchModal = document.getElementById("techMatchModal");

    if (closeTechModal && techMatchModal) closeTechModal.onclick = function() { techMatchModal.hidden = true; };
    if (cancelTechModal && techMatchModal) cancelTechModal.onclick = function() { techMatchModal.hidden = true; };
});

fnKichHoatDieuPhoi();
