
/* LAY DANH SACH TAI KHOAN */
function layTaiKhoan() {
    try {
        const duLieu = JSON.parse(localStorage.getItem("fixflow_users") || "[]");
        return Array.isArray(duLieu) ? duLieu : [];
    } catch (error) {
        return [];
    }
}

/* HIEN THONG BAO */
function hienThongBao(id, noiDung, loai) {
    const hop = document.getElementById(id);

    if (hop) {
        hop.textContent = noiDung;
        hop.className = "message " + loai;
    }
}

/* KIEM TRA TRANG */
const trangHienTai = document.body.dataset.page;
const nguoiDung = sessionStorage.getItem("fixflow_currentUser");

if (trangHienTai === "home" && !nguoiDung) {
    window.location.replace("login.html");
}

if ((trangHienTai === "login" || trangHienTai === "register") && nguoiDung) {
    window.location.replace("index.html");
}

/* DANG KY */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const hoTen = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const matKhau = document.getElementById("registerPassword").value;
        const xacNhan = document.getElementById("confirmPassword").value;

        if (hoTen === "") {
            hienThongBao("registerMessage", "Vui lòng nhập họ và tên.", "error");
            return;
        }

        if (matKhau.length < 6) {
            hienThongBao("registerMessage", "Mật khẩu cần ít nhất 6 ký tự.", "error");
            return;
        }

        if (matKhau !== xacNhan) {
            hienThongBao("registerMessage", "Hai mật khẩu không trùng khớp.", "error");
            return;
        }

        const danhSach = layTaiKhoan();

        for (let i = 0; i < danhSach.length; i++) {
            if (danhSach[i].email === email) {
                hienThongBao("registerMessage", "Email này đã được đăng ký.", "error");
                return;
            }
        }

        danhSach.push({
            hoTen: hoTen,
            email: email,
            matKhau: matKhau
        });

        try {
            localStorage.setItem("fixflow_users", JSON.stringify(danhSach));
            localStorage.setItem("fixflow_lastEmail", email);

            alert("Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.");
            window.location.href = "login.html";
        } catch (error) {
            hienThongBao(
                "registerMessage",
                "Không thể lưu tài khoản. Hãy thử lại.",
                "error"
            );
        }
    });
}

/* DANG NHAP */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const emailDaNho = localStorage.getItem("fixflow_lastEmail");

    if (emailDaNho) {
        document.getElementById("loginEmail").value = emailDaNho;
        document.getElementById("rememberMe").checked = true;
    }

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const matKhau = document.getElementById("loginPassword").value;
        const ghiNho = document.getElementById("rememberMe").checked;
        const danhSach = layTaiKhoan();

        let taiKhoan = null;

        for (let i = 0; i < danhSach.length; i++) {
            if (danhSach[i].email === email && danhSach[i].matKhau === matKhau) {
                taiKhoan = danhSach[i];
                break;
            }
        }

        if (taiKhoan === null) {
            hienThongBao(
                "loginMessage",
                "Email hoặc mật khẩu không chính xác.",
                "error"
            );
            return;
        }

        if (ghiNho) {
            localStorage.setItem("fixflow_lastEmail", email);
        } else {
            localStorage.removeItem("fixflow_lastEmail");
        }

        sessionStorage.setItem("fixflow_currentUser", JSON.stringify({
            hoTen: taiKhoan.hoTen,
            email: taiKhoan.email
        }));

        window.location.href = "index.html";
    });
}

/* HIEN AN MAT KHAU */
const cacNutMatKhau = document.querySelectorAll(".toggle-password");

cacNutMatKhau.forEach(function(nut) {
    nut.addEventListener("click", function() {
        const oNhap = document.getElementById(nut.dataset.target);

        if (oNhap.type === "password") {
            oNhap.type = "text";
        } else {
            oNhap.type = "password";
        }
    });
});
