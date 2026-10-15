
/* =================================
   FIXFLOW - TAO YEU CAU
================================= */

const form = document.getElementById("ticketForm");
const inputMoTa = document.getElementById("description");
const demKyTu = document.getElementById("descriptionCount");
const inputAnh = document.getElementById("image");
const khungAnh = document.getElementById("imagePreview");
const anhXemTruoc = document.getElementById("previewPicture");
const nutXoaAnh = document.getElementById("removeImage");
const thongBaoLoi = document.getElementById("formError");
const nutGui = document.getElementById("submitTicket");

let anhDuLieu = "";

// Kiem tra tai khoan dang nhap
let taiKhoan = null;

try {
    taiKhoan = JSON.parse(
        sessionStorage.getItem("fixflow_currentUser") || "null"
    );
} catch (error) {
    taiKhoan = null;
}

if (!taiKhoan) {
    window.location.replace("login.html");
} else {
    const hoTen = taiKhoan.hoTen || "Người dùng";
    const email = taiKhoan.email || "";

    document.getElementById("sidebarName").textContent = hoTen;
    document.getElementById("sidebarEmail").textContent = email;
    document.getElementById("topName").textContent = hoTen;
    document.getElementById("topEmail").textContent = email;

    document.getElementById("sidebarAvatar").textContent =
        hoTen.trim().charAt(0).toUpperCase() || "U";

    document.getElementById("topAvatar").textContent =
        hoTen.trim().charAt(0).toUpperCase() || "U";
}

// Dem so ky tu mo ta
inputMoTa.addEventListener("input", function() {
    demKyTu.textContent = inputMoTa.value.length + "/2000";
});

// Xem truoc anh
inputAnh.addEventListener("change", function() {
    thongBaoLoi.hidden = true;

    const file = inputAnh.files[0];

    if (!file) {
        return;
    }

    const dinhDangHopLe = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!dinhDangHopLe.includes(file.type)) {
        hienLoi("Vui lòng chọn ảnh PNG, JPG hoặc WEBP.");

        inputAnh.value = "";
        anhDuLieu = "";
        khungAnh.hidden = true;
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        hienLoi("Ảnh không được vượt quá 2 MB.");

        inputAnh.value = "";
        anhDuLieu = "";
        khungAnh.hidden = true;
        return;
    }

    const docAnh = new FileReader();

    docAnh.onload = function() {
        anhDuLieu = docAnh.result;
        anhXemTruoc.src = anhDuLieu;
        khungAnh.hidden = false;
    };

    docAnh.onerror = function() {
        hienLoi("Không thể đọc ảnh. Vui lòng chọn ảnh khác.");
        inputAnh.value = "";
    };

    docAnh.readAsDataURL(file);
});

// Xoa anh da chon
nutXoaAnh.addEventListener("click", function() {
    inputAnh.value = "";
    anhDuLieu = "";
    anhXemTruoc.removeAttribute("src");
    khungAnh.hidden = true;
});

// Hien thong bao loi
function hienLoi(noiDung) {
    thongBaoLoi.textContent = noiDung;
    thongBaoLoi.hidden = false;
    thongBaoLoi.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Tao ma yeu cau
function taoMaYeuCau() {
    const thoiGian = Date.now().toString().slice(-8);
    const ngauNhien = Math.floor(Math.random() * 900 + 100);

    return "FF-" + thoiGian + ngauNhien;
}

// Gui yeu cau
form.addEventListener("submit", function(event) {
    event.preventDefault();
    thongBaoLoi.hidden = true;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!taiKhoan) {
        window.location.href = "login.html";
        return;
    }

    const tieuDe = document.getElementById("title").value.trim();
    const thietBi = document.getElementById("asset").value;
    const danhMuc = document.getElementById("category").value;
    const mucDo = document.getElementById("priority").value;
    const viTri = document.getElementById("location").value.trim();
    const moTa = inputMoTa.value.trim();

    if (!tieuDe || !thietBi || !danhMuc || !viTri || !moTa) {
        hienLoi("Vui lòng điền đầy đủ các trường bắt buộc.");
        return;
    }

    if (moTa.length < 10) {
        hienLoi("Mô tả sự cố cần có ít nhất 10 ký tự.");
        inputMoTa.focus();
        return;
    }

    const dongY = confirm(
        "Bạn có chắc chắn muốn tạo yêu cầu bảo trì này không?"
    );

    if (!dongY) {
        return;
    }

    // Doc danh sach yeu cau da luu
    let danhSach = [];

    try {
        const duLieuCu = JSON.parse(
            localStorage.getItem("fixflow_tickets") || "[]"
        );

        if (Array.isArray(duLieuCu)) {
            danhSach = duLieuCu;
        }
    } catch (error) {
        hienLoi("Không đọc được dữ liệu yêu cầu đã lưu.");
        return;
    }

    // Tao yeu cau moi
    const yeuCauMoi = {
        ma: taoMaYeuCau(),
        tieuDe: tieuDe,
        tenThietBi: thietBi,
        danhMuc: danhMuc,
        mucDo: mucDo,
        viTri: viTri,
        moTa: moTa,
        anh: anhDuLieu,
        trangThai: "Chờ xử lý",
        nguoiTao: taiKhoan.hoTen || "",
        emailNguoiTao: taiKhoan.email || "",
        ngayTao: new Date().toLocaleString("vi-VN")
    };

    danhSach.push(yeuCauMoi);

    // Luu vao localStorage
    try {
        localStorage.setItem(
            "fixflow_tickets",
            JSON.stringify(danhSach)
        );
    } catch (error) {
        hienLoi(
            "Không thể lưu yêu cầu. Có thể bộ nhớ trình duyệt đã đầy. " +
            "Hãy thử bỏ ảnh đính kèm hoặc chọn ảnh nhỏ hơn."
        );
        return;
    }

    alert(
        "Tạo yêu cầu thành công!\n" +
        "Mã yêu cầu: " + yeuCauMoi.ma
    );

    // Chuyen sang trang danh sach yeu cau
    window.location.href = "request-list.html";
});

// Xu ly nut xoa noi dung
form.addEventListener("reset", function() {
    setTimeout(function() {
        anhDuLieu = "";
        anhXemTruoc.removeAttribute("src");
        khungAnh.hidden = true;
        thongBaoLoi.hidden = true;
        demKyTu.textContent = "0/2000";
    }, 0);
});

// Xac nhan dang xuat
const hopDangXuat = document.getElementById("logoutModal");

document.getElementById("openLogout").addEventListener("click", function() {
    hopDangXuat.hidden = false;
});

document.getElementById("closeLogout").addEventListener("click", function() {
    hopDangXuat.hidden = true;
});

document.getElementById("cancelLogout").addEventListener("click", function() {
    hopDangXuat.hidden = true;
});

hopDangXuat.addEventListener("click", function(event) {
    if (event.target === hopDangXuat) {
        hopDangXuat.hidden = true;
    }
});

document.getElementById("confirmLogout").addEventListener("click", function() {
    sessionStorage.removeItem("fixflow_currentUser");
    window.location.href = "login.html";
});
    
