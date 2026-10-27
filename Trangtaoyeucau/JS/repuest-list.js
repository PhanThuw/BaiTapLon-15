
const ticketTableBody = document.getElementById("ticketTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const taiKhoan = JSON.parse(
    sessionStorage.getItem("fixflow_currentUser") || "null"
);

// Kiểm tra người dùng đã đăng nhập chưa
if (!taiKhoan) {
    window.location.replace("login.html");
}

// Hiển thị tên người dùng
document.getElementById("userName").textContent =
    taiKhoan ? (taiKhoan.hoTen || taiKhoan.email || "Người dùng") : "Người dùng";

// Lấy danh sách yêu cầu đã lưu
function layDanhSachYeuCau() {
    try {
        const danhSach = JSON.parse(
            localStorage.getItem("fixflow_tickets") || "[]"
        );

        return Array.isArray(danhSach) ? danhSach : [];
    } catch (error) {
        return [];
    }
}

// Chuẩn hóa trạng thái để phân loại
function phanLoaiTrangThai(trangThai) {
    const status = (trangThai || "Chờ xử lý").toLowerCase();

    if (status.includes("hoàn thành")) {
        return "done";
    }

    if (status.includes("hủy")) {
        return "cancelled";
    }

    if (status.includes("đang")) {
        return "working";
    }

    return "pending";
}

// Tạo nhãn trạng thái
function taoNhanTrangThai(trangThai) {
    const loai = phanLoaiTrangThai(trangThai);

    let className = "status-tag";

    if (loai === "working") {
        className += " status-working";
    } else if (loai === "done") {
        className += " status-done";
    } else if (loai === "cancelled") {
        className += " status-cancelled";
    }

    return `<span class="${className}">${trangThai || "Chờ xử lý"}</span>`;
}

// Tránh hiển thị nội dung nhập vào như HTML
function hienThiAnToan(noiDung) {
    const div = document.createElement("div");
    div.textContent = noiDung == null ? "" : String(noiDung);
    return div.innerHTML;
}

// Chuyển ngày thành dạng dễ đọc
function dinhDangNgay(ngay) {
    if (!ngay) return "—";

    const date = new Date(ngay);

    if (Number.isNaN(date.getTime())) {
        return String(ngay);
    }

    return date.toLocaleDateString("vi-VN");
}

// Cập nhật các ô thống kê
function capNhatThongKe(danhSach) {
    document.getElementById("totalCount").textContent =
        danhSach.length;

    document.getElementById("pendingCount").textContent =
        danhSach.filter(ticket =>
            phanLoaiTrangThai(ticket.trangThai) === "pending"
        ).length;

    document.getElementById("workingCount").textContent =
        danhSach.filter(ticket =>
            phanLoaiTrangThai(ticket.trangThai) === "working"
        ).length;

    document.getElementById("doneCount").textContent =
        danhSach.filter(ticket =>
            phanLoaiTrangThai(ticket.trangThai) === "done"
        ).length;
}

// Hiển thị danh sách
function hienThiDanhSach() {
    const danhSach = layDanhSachYeuCau();

    // Chỉ hiện yêu cầu do tài khoản hiện tại tạo
    const cuaToi = danhSach.filter(ticket =>
        ticket.emailNguoiTao === taiKhoan.email
    );

    capNhatThongKe(cuaToi);

    const tuKhoa = searchInput.value.trim().toLowerCase();
    const trangThai = statusFilter.value;

    const ketQua = cuaToi.filter(ticket => {
        const noiDungTimKiem = [
            ticket.ma,
            ticket.tieuDe,
            ticket.tenThietBi,
            ticket.danhMuc
        ].join(" ").toLowerCase();

        const dungTuKhoa = noiDungTimKiem.includes(tuKhoa);
        const dungTrangThai = !trangThai ||
            (ticket.trangThai || "Chờ xử lý") === trangThai;

        return dungTuKhoa && dungTrangThai;
    });

    if (ketQua.length === 0) {
        ticketTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:30px">
                    Chưa có yêu cầu phù hợp.
                    <br><br>
                    <a href="create-ticket.html">Tạo yêu cầu bảo trì mới</a>
                </td>
            </tr>
        `;

        document.getElementById("resultCount").textContent =
            "Hiển thị 0 yêu cầu";
        return;
    }

    ticketTableBody.innerHTML = ketQua.map(ticket => `
        <tr>
            <td>${hienThiAnToan(ticket.ma || "—")}</td>
            <td>${hienThiAnToan(ticket.tieuDe || "Không có tiêu đề")}</td>
            <td>${hienThiAnToan(ticket.tenThietBi || "—")}</td>
            <td>${hienThiAnToan(ticket.mucDo || "—")}</td>
            <td>${hienThiAnToan(dinhDangNgay(ticket.ngayTao))}</td>
            <td>${taoNhanTrangThai(hienThiAnToan(ticket.trangThai || "Chờ xử lý"))}</td>
            <td>
                <button class="request-view-btn"
                    type="button"
                    data-ticket-id="${hienThiAnToan(ticket.ma)}">
                    Chi tiết
                </button>
            </td>
        </tr>
    `).join("");

    document.getElementById("resultCount").textContent =
        `Hiển thị ${ketQua.length} / ${cuaToi.length} yêu cầu`;
}

// Mở cửa sổ xem chi tiết
function xemChiTiet(ma) {
    const ticket = layDanhSachYeuCau().find(item =>
        item.ma === ma &&
        item.emailNguoiTao === taiKhoan.email
    );

    if (!ticket) return;

    const noiDung = document.getElementById("ticketDetail");

    noiDung.innerHTML = `
        <div class="detail-item">
            <strong>Mã yêu cầu</strong>
            ${hienThiAnToan(ticket.ma)}
        </div>

        <div class="detail-item">
            <strong>Tiêu đề</strong>
            ${hienThiAnToan(ticket.tieuDe)}
        </div>

        <div class="detail-item">
            <strong>Thiết bị</strong>
            ${hienThiAnToan(ticket.tenThietBi)}
        </div>

        <div class="detail-item">
            <strong>Danh mục</strong>
            ${hienThiAnToan(ticket.danhMuc)}
        </div>

        <div class="detail-item">
            <strong>Mức độ ưu tiên</strong>
            ${hienThiAnToan(ticket.mucDo)}
        </div>

        <div class="detail-item">
            <strong>Vị trí thiết bị</strong>
            ${hienThiAnToan(ticket.viTri)}
        </div>

        <div class="detail-item">
            <strong>Mô tả sự cố</strong>
            ${hienThiAnToan(ticket.moTa)}
        </div>

        <div class="detail-item">
            <strong>Ngày tạo</strong>
            ${hienThiAnToan(dinhDangNgay(ticket.ngayTao))}
        </div>

        <div class="detail-item">
            <strong>Trạng thái</strong>
            ${taoNhanTrangThai(hienThiAnToan(ticket.trangThai || "Chờ xử lý"))}
        </div>

        ${ticket.anh ? `
            <div class="detail-item">
                <strong>Ảnh thiết bị</strong>
                <img class="detail-image"
                    src="${hienThiAnToan(ticket.anh)}"
                    alt="Ảnh thiết bị">
            </div>
        ` : ""}
    `;

    document.getElementById("detailModal").classList.add("show");
}

// Bấm nút Chi tiết
ticketTableBody.addEventListener("click", function(event) {
    const button = event.target.closest("[data-ticket-id]");

    if (button) {
        xemChiTiet(button.dataset.ticketId);
    }
});

// Tìm kiếm và lọc
searchInput.addEventListener("input", hienThiDanhSach);
statusFilter.addEventListener("change", hienThiDanhSach);

// Đóng cửa sổ chi tiết
document.getElementById("closeDetailBtn").addEventListener("click", function() {
    document.getElementById("detailModal").classList.remove("show");
});

document.getElementById("detailModal").addEventListener("click", function(event) {
    if (event.target === this) {
        this.classList.remove("show");
    }
});

// Đăng xuất
document.getElementById("logoutBtn").addEventListener("click", function() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        sessionStorage.removeItem("fixflow_currentUser");
        window.location.href = "login.html";
    }
});

// Hiển thị lần đầu
hienThiDanhSach();
