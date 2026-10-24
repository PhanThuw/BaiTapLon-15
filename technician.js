/* ===================================================
   FIXFLOW - CONG VIEC KY THUAT VIEN & AI CHECKLIST
=================================================== */

// Elements DOM
const techWorkQueueBody = document.getElementById("techWorkQueueBody");
const techSearchInput = document.getElementById("techSearchInput");
const techStatusFilter = document.getElementById("techStatusFilter");

const repairDetailModal = document.getElementById("repairDetailModal");
const closeRepairModal = document.getElementById("closeRepairModal");
const btnCancelRepair = document.getElementById("btnCancelRepair");
const repairUpdateForm = document.getElementById("repairUpdateForm");

const repairTicketSummary = document.getElementById("repairTicketSummary");
const currentTicketIdInput = document.getElementById("currentTicketId");
const technicianNoteInput = document.getElementById("technicianNote");
const updateStatusSelect = document.getElementById("updateStatus");

// AI Elements
const btnGenerateAiChecklist = document.getElementById("btnGenerateAiChecklist");
const aiLoadingState = document.getElementById("aiLoadingState");
const aiErrorState = document.getElementById("aiErrorState");
const aiChecklistResult = document.getElementById("aiChecklistResult");
const aiExplanation = document.getElementById("aiExplanation");
const aiChecklistItems = document.getElementById("aiChecklistItems");
const btnAcceptAi = document.getElementById("btnAcceptAi");
const btnRejectAi = document.getElementById("btnRejectAi");

let activeTicket = null;
let generatedChecklistData = [];

// 1. Kiem tra phien dang nhap
let taiKhoan = null;
try {
    taiKhoan = JSON.parse(sessionStorage.getItem("fixflow_currentUser") || "null");
} catch (e) {
    taiKhoan = null;
}

if (!taiKhoan) {
    window.location.replace("login.html");
} else {
    const hoTen = taiKhoan.hoTen || "Kỹ thuật viên";
    const email = taiKhoan.email || "tech@fixflow.com";

    document.getElementById("sidebarName").textContent = hoTen;
    document.getElementById("sidebarEmail").textContent = email;
    document.getElementById("topName").textContent = hoTen;
    document.getElementById("topEmail").textContent = email;

    const charAvatar = hoTen.trim().charAt(0).toUpperCase() || "T";
    document.getElementById("sidebarAvatar").textContent = charAvatar;
    document.getElementById("topAvatar").textContent = charAvatar;
}

// 2. Doc danh sach ticket tu LocalStorage
function layTatCaTicket() {
    try {
        const data = JSON.parse(localStorage.getItem("fixflow_tickets") || "[]");
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function luuDanhSachTicket(danhSach) {
    localStorage.setItem("fixflow_tickets", JSON.stringify(danhSach));
}

// 3. Render Thong ke
function capNhatThongKeTech(danhSach) {
    document.getElementById("techTotalCount").textContent = danhSach.length;
    document.getElementById("techPendingCount").textContent = 
        danhSach.filter(t => (t.trangThai || "Chờ xử lý") === "Chờ xử lý").length;
    document.getElementById("techWorkingCount").textContent = 
        danhSach.filter(t => t.trangThai === "Đang sửa chữa").length;
    document.getElementById("techDoneCount").textContent = 
        danhSach.filter(t => t.trangThai === "Đã hoàn thành").length;
}

// 4. Render Bảng Work Queue
function hienThiWorkQueue() {
    const danhSach = layTatCaTicket();
    capNhatThongKeTech(danhSach);

    const tuKhoa = techSearchInput.value.trim().toLowerCase();
    const locTrangThai = techStatusFilter.value;

    const ketQua = danhSach.filter(t => {
        const textSearch = [t.ma, t.tieuDe, t.tenThietBi, t.viTri].join(" ").toLowerCase();
        const khopTuKhoa = textSearch.includes(tuKhoa);
        const khopTrangThai = !locTrangThai || (t.trangThai || "Chờ xử lý") === locTrangThai;
        return khopTuKhoa && khopTrangThai;
    });

    if (ketQua.length === 0) {
        techWorkQueueBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-cell">
                    Không tìm thấy yêu cầu bảo trì nào phù hợp.
                </td>
            </tr>
        `;
        return;
    }

    techWorkQueueBody.innerHTML = ketQua.map(t => {
        let badgeClass = "ticket-status";
        if (t.trangThai === "Đang sửa chữa") badgeClass += " working";
        if (t.trangThai === "Đã hoàn thành") badgeClass += " done";

        return `
            <tr>
                <td><b>${escapeHtml(t.ma || "—")}</b></td>
                <td>${escapeHtml(t.tieuDe || "—")}</td>
                <td>${escapeHtml(t.tenThietBi || "—")}</td>
                <td>${escapeHtml(t.viTri || "—")}</td>
                <td><small>${escapeHtml(t.mucDo || "Trung bình")}</small></td>
                <td><span class="${badgeClass}">${escapeHtml(t.trangThai || "Chờ xử lý")}</span></td>
                <td>
                    <button type="button" class="request-view-btn" data-tech-id="${escapeHtml(t.ma)}">
                        ⚒ Xử lý
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

// 5. Mo Modal Repair Detail
function moDetailRepair(maTicket) {
    const danhSach = layTatCaTicket();
    activeTicket = danhSach.find(t => t.ma === maTicket);

    if (!activeTicket) return;

    currentTicketIdInput.value = activeTicket.ma;
    technicianNoteInput.value = activeTicket.ghiChuKyThuat || "";
    updateStatusSelect.value = activeTicket.trangThai === "Đã hoàn thành" ? "Đã hoàn thành" : "Đang sửa chữa";

    // Re-set AI state
    resetAiState();

    // Hien thi noi dung tom tat ticket
    repairTicketSummary.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px;">
            <div><b>Mã sự cố:</b> ${escapeHtml(activeTicket.ma)}</div>
            <div><b>Thiết bị:</b> ${escapeHtml(activeTicket.tenThietBi)}</div>
            <div><b>Vị trí:</b> ${escapeHtml(activeTicket.viTri)}</div>
            <div><b>Mức độ:</b> ${escapeHtml(activeTicket.mucDo)}</div>
            <div style="grid-column: span 2;"><b>Mô tả lỗi:</b> ${escapeHtml(activeTicket.moTa)}</div>
        </div>
    `;

    repairDetailModal.classList.add("show");
}

function dongDetailRepair() {
    repairDetailModal.classList.remove("show");
    activeTicket = null;
}

// 6. TINH NANG AI REPAIR CHECKLIST (AI-2)
function resetAiState() {
    aiLoadingState.hidden = true;
    aiErrorState.hidden = true;
    aiChecklistResult.hidden = true;
    generatedChecklistData = [];
}

btnGenerateAiChecklist.addEventListener("click", function() {
    if (!activeTicket) return;

    resetAiState();
    aiLoadingState.hidden = false;

    // Gia lap AI phan tich trong 1.2 giay
    setTimeout(() => {
        aiLoadingState.hidden = true;

        const moTaLower = (activeTicket.moTa || "").toLowerCase();
        const thietBiLower = (activeTicket.tenThietBi || "").toLowerCase();

        // Kiem tra truong hop AI "that bai / khong du du lieu"
        if (moTaLower.length < 5) {
            aiErrorState.hidden = false;
            return;
        }

        // Rule-based AI Checklist Generator
        generatedChecklistData = [
            "Kiểm tra nguồn điện và hệ thống dây cáp kết nối",
            "Đo kiểm tra tín hiệu phần cứng ban đầu",
            "Vệ sinh bụi bẩn và kiểm tra quạt tản nhiệt"
        ];

        if (thietBiLower.includes("máy tính") || moTaLower.includes("khởi động")) {
            generatedChecklistData.push("Kiểm tra RAM và bo mạch chủ");
            generatedChecklistData.push("Kiểm tra hệ điều hành và log lỗi phần mềm");
        } else if (thietBiLower.includes("máy in")) {
            generatedChecklistData.push("Kiểm tra hộp mực và gạt mực");
            generatedChecklistData.push("Kiểm tra cụm sấy và cuộn kéo giấy");
        } else if (thietBiLower.includes("điều hòa")) {
            generatedChecklistData.push("Kiểm tra áp suất gas và đường ống dẫn");
            generatedChecklistData.push("Vệ sinh lưới lọc bụi dàn lạnh");
        } else {
            generatedChecklistData.push("Chạy thử nghiệm thiết bị sau khi hiệu chỉnh");
        }

        aiExplanation.textContent = `Phát hiện loại thiết bị "${activeTicket.tenThietBi}" kết hợp với mô tả lỗi "${activeTicket.moTa.substring(0, 30)}..."`;
        
        aiChecklistItems.innerHTML = generatedChecklistData.map((item, index) => `
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 6px;">
                <input type="checkbox" checked id="ai_chk_${index}">
                <span>${escapeHtml(item)}</span>
            </label>
        `).join("");

        aiChecklistResult.hidden = false;
    }, 1200);
});

btnAcceptAi.addEventListener("click", function() {
    const selectedTasks = [];
    generatedChecklistData.forEach((item, index) => {
        const chk = document.getElementById(`ai_chk_${index}`);
        if (chk && chk.checked) {
            selectedTasks.push("• " + item);
        }
    });

    const currentNote = technicianNoteInput.value.trim();
    technicianNoteInput.value = (currentNote ? currentNote + "\n\n" : "") + 
        "--- REPAIR CHECKLIST (AI) ---\n" + selectedTasks.join("\n");

    aiChecklistResult.hidden = true;
    alert("Đã thêm Checklist AI vào nhật ký sửa chữa!");
});

btnRejectAi.addEventListener("click", function() {
    resetAiState();
});

// 7. Luu va Cap nhat trang thai Ticket
repairUpdateForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const ticketMa = currentTicketIdInput.value;
    const ghiChu = technicianNoteInput.value.trim();
    const trangThaiMoi = updateStatusSelect.value;

    const danhSach = layTatCaTicket();
    const index = danhSach.findIndex(t => t.ma === ticketMa);

    if (index !== -1) {
        danhSach[index].ghiChuKyThuat = ghiChu;
        danhSach[index].trangThai = trangThaiMoi;
        danhSach[index].nguoiXuLy = taiKhoan.hoTen || "Kỹ thuật viên";
        danhSach[index].ngayCapNhat = new Date().toLocaleString("vi-VN");

        luuDanhSachTicket(danhSach);
        alert("Cập nhật tiến độ sửa chữa thành công!");
        dongDetailRepair();
        hienThiWorkQueue();
    }
});

// Sự kiện UI
techWorkQueueBody.addEventListener("click", function(e) {
    const btn = e.target.closest("[data-tech-id]");
    if (btn) {
        moDetailRepair(btn.dataset.techId);
    }
});

techSearchInput.addEventListener("input", hienThiWorkQueue);
techStatusFilter.addEventListener("change", hienThiWorkQueue);

closeRepairModal.addEventListener("click", dongDetailRepair);
btnCancelRepair.addEventListener("click", dongDetailRepair);

// Logout Modal Logic
const logoutModal = document.getElementById("logoutModal");
document.getElementById("openLogout").addEventListener("click", () => logoutModal.hidden = false);
document.getElementById("closeLogout").addEventListener("click", () => logoutModal.hidden = true);
document.getElementById("cancelLogout").addEventListener("click", () => logoutModal.hidden = true);
document.getElementById("confirmLogout").addEventListener("click", () => {
    sessionStorage.removeItem("fixflow_currentUser");
    window.location.href = "login.html";
});

// khoi tao
hienThiWorkQueue();