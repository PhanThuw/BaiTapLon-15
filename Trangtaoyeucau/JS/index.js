

    const roleButton = document.getElementById("roleButton");
    const roleDropdown = document.getElementById("roleDropdown");

    // Bam vao Vai tro de mo hoac dong menu
    roleButton.addEventListener("click", function () {
        const dangMo = !roleDropdown.hidden;

        roleDropdown.hidden = dangMo;
        roleButton.setAttribute("aria-expanded", String(!dangMo));
    });

    // Bam vao tung vai tro de hien cac chuc nang
    const roleOptions = document.querySelectorAll(".role-option");

    roleOptions.forEach(function (button) {
        button.addEventListener("click", function () {
            const submenu = button.nextElementSibling;
            const dangMo = !submenu.hidden;

            // Dong cac menu con khac
            document.querySelectorAll(".role-submenu").forEach(function (menu) {
                menu.hidden = true;
            });

            document.querySelectorAll(".role-option").forEach(function (item) {
                item.classList.remove("selected");
            });

            // Neu menu nay dang dong thi mo no
            if (!dangMo) {
                submenu.hidden = false;
                button.classList.add("selected");
            }
        });
    });

    // Bam ra ngoai thi dong menu Vai tro
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".role-menu")) {
            roleDropdown.hidden = true;
            roleButton.setAttribute("aria-expanded", "false");

            document.querySelectorAll(".role-submenu").forEach(function (menu) {
                menu.hidden = true;
            });

            document.querySelectorAll(".role-option").forEach(function (item) {
                item.classList.remove("selected");
            });
        }
    });
