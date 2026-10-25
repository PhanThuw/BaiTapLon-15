/* ===================================================
   FIXFLOW - BÁO CÁO THỐNG KÊ & AI FAILURE PATTERN (JS)
=================================================== */

document.addEventListener("DOMContentLoaded", function() {
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

    const hoTen = currentUser.hoTen || "Quản lý bảo trì";
    const email = currentUser.email || "manager@fixflow.com";
    document.getElementById("sidebarName").textContent = hoTen;
    document.getElementById("sidebarEmail").textContent = email;
    document.getElementById("topName").textContent = hoTen;
    document.getElementById("managerEmail").textContent = email;
    const initial = hoTen.charAt(0).toUpperCase();
    document.getElementById("sidebarAvatar").textContent = initial;
    document.getElementById("topAvatar").textContent = initial;

    function loadReportData() {
        let tickets = [];
        try {
            tickets = JSON.parse(localStorage.getItem("fixflow_tickets") || "[]");
        } catch(e) {
            tickets = [];
        }

        const total = tickets.length;
        const done = tickets.filter(t => (t.trangThai || "").includes("hoàn thành")).length;
        const pending = total - done;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;

        document.getElementById("repTotal").textContent = total;
        document.getElementById("repDone").textContent = done;
        document.getElementById("repPending").textContent = pending;
        document.getElementById("repRate").textContent = rate + "%";

        const statsMap = {};
        tickets.forEach(t => {
            const dev = t.tenThietBi || "Khác";
            if(!statsMap[dev]) {
                statsMap[dev] = { total: 0, pending: 0, working: 0, done: 0 };
            }
            statsMap[dev].total++;
            const st = t.trangThai || "Chờ xử lý";
            if(st.includes("hoàn thành")) statsMap[dev].done++;
            else if(st.includes("đang")) statsMap[dev].working++;
            else statsMap[dev].pending++;
        });

        const tbody = document.getElementById("assetReportTableBody");
        const keys = Object.keys(statsMap);
        if(keys.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">Chưa có dữ liệu sự cố để thống kê.</td></tr>`;
            return;
        }

        tbody.innerHTML = keys.map(dev => `
            <tr>
                <td><b>${escapeHtml(dev)}</b></td>
                <td>${statsMap[dev].total}</td>
                <td>${statsMap[dev].pending}</td>
                <td>${statsMap[dev].working}</td>
                <td><span class="ticket-status done">${statsMap[dev].done}</span></td>
            </tr>
        `).join("");
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : String(str);
        return div.innerHTML;
    }

    // AI Failure Pattern Summary (AI-3) mô phỏng trải nghiệm AI chuẩn
    const btnRunAiSummary = document.getElementById("btnRunAiSummary");
    const aiReportLoading = document.getElementById("aiReportLoading");
    const aiReportError = document.getElementById("aiReportError");
    const aiReportResult = document.getElementById("aiReportResult");
    const aiReportContent = document.getElementById("aiReportContent");
    const aiReportExplanation = document.getElementById("aiReportExplanation");

    btnRunAiSummary.addEventListener("click", function() {
        aiReportLoading.hidden = false;
        aiReportError.hidden = true;
        aiReportResult.hidden = true;

        setTimeout(() => {
            aiReportLoading.hidden = true;
            let tickets = [];
            try {
                tickets = JSON.parse(localStorage.getItem("fixflow_tickets") || "[]");
            } catch(e) {}

            if(tickets.length < 2) {
                aiReportError.hidden = false;
                return;
            }

            aiReportExplanation.textContent = `Đã quét và phân tích ${tickets.length} yêu cầu bảo trì gần nhất từ cơ sở dữ liệu hệ thống.`;
            aiReportContent.innerHTML = `
                <p><b>1. Thiết bị có tần suất lỗi cao:</b> Máy tính và Thiết bị mạng ghi nhận lượng ticket báo cáo lớn nhất.</p>
                <p><b>2. Phân tích xu hướng:</b> Các sự cố lỗi mạng và hệ thống điện thường xuất hiện tập trung vào giờ cao điểm.</p>
                <p><b>3. Khuyến nghị hành động:</b> Quản lý nên lập kế hoạch bảo trì định kỳ cho các thiết bị ngoại vi và nâng cấp hạ tầng mạng để giảm thiểu tái diễn sự cố.</p>
            `;
            aiReportResult.hidden = false;
        }, 1200);
    });

    document.getElementById("btnDismissAiReport").addEventListener("click", () => {
        aiReportResult.hidden = true;
    });

    document.getElementById("btnApplyAiReport").addEventListener("click", () => {
        alert("Đã lưu báo cáo khuyến nghị vào kế hoạch bảo trì của quản lý!");
        aiReportResult.hidden = true;
    });

    document.getElementById("openLogout").addEventListener("click", () => {
        if(confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            sessionStorage.removeItem("fixflow_currentUser");
            window.location.href = "login.html";
        }
    });

    loadReportData();
});