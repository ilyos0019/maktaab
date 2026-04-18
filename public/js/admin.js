async function renderAdminDashboard() {
    showLoading();
    try {
        const teachersRes = await fetch('/api/teachers');
        const studentsRes = await fetch('/api/students');
        
        let tCount = 0, sCount = 0;
        if(teachersRes.ok) tCount = (await teachersRes.json()).length;
        if(studentsRes.ok) sCount = (await studentsRes.json()).length;

        const content = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Jami Ustozlar</div>
                    <div class="stat-value">${tCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Jami O'quvchilar</div>
                    <div class="stat-value">${sCount}</div>
                </div>
            </div>
            <div class="card">
                <h3>Xush kelibsiz, Admin!</h3>
                <p>Chap menyudan kerakli bo'limni tanlang.</p>
            </div>
        `;
        App.innerHTML = getLayoutTemplate(content, 'Bosh sahifa', 'home');
    } catch (e) {
        App.innerHTML = getLayoutTemplate("Xato yuz berdi", 'Bosh sahifa', 'home');
    }
}

async function renderAdminTeachers() {
    showLoading();
    try {
        const res = await fetch('/api/teachers');
        const teachers = await res.json();
        
        let html = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                <h3>Ustozlar ro'yxati</h3>
                <button class="btn btn-primary" onclick="showAddTeacherModal()">+ Qo'shish</button>
            </div>
        `;

        // Desktop Table
        html += `<table class="desktop-table">
            <thead>
                <tr>
                    <th>F.I.Sh</th>
                    <th>Fan</th>
                    <th>Sinf</th>
                    <th>Telefon</th>
                    <th>Amallar</th>
                </tr>
            </thead>
            <tbody>
                ${teachers.map(t => `
                    <tr>
                        <td>${t.full_name}</td>
                        <td>${t.subject}</td>
                        <td>${t.class_name}</td>
                        <td>${t.phone}</td>
                        <td>
                            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="resetTeacherPass(${t.id})">Parol</button>
                            <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="deleteTeacher(${t.id})">O'chirish</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;

        // Mobile Cards
        html += `<div class="mobile-cards">
            ${teachers.map(t => `
                <div class="data-card">
                    <div class="data-card-header">
                        <span>${t.full_name}</span>
                    </div>
                    <div class="data-card-body">
                        <p><strong>Fan:</strong> ${t.subject}</p>
                        <p><strong>Sinf:</strong> ${t.class_name}</p>
                        <p><strong>Tel:</strong> ${t.phone}</p>
                    </div>
                    <div class="data-card-actions">
                        <button class="btn btn-outline" style="padding:6px 10px;" onclick="resetTeacherPass(${t.id})">Parol</button>
                        <button class="btn btn-danger" style="padding:6px 10px;" onclick="deleteTeacher(${t.id})">O'chirish</button>
                    </div>
                </div>
            `).join('')}
        </div>`;

        App.innerHTML = getLayoutTemplate(html, 'Ustozlar', 'teachers');
    } catch (e) {
        showToast("Xato", "error");
    }
}

function showAddTeacherModal() {
    ModalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close" onclick="ModalContainer.innerHTML=''">×</button>
                <h3 style="margin-bottom:20px;">Yangi ustoz qo'shish</h3>
                <form id="addTeacherForm">
                    <div class="form-group">
                        <label>F.I.Sh</label>
                        <input type="text" id="t_name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Fan</label>
                        <input type="text" id="t_sub" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Biriktirilgan sinf</label>
                        <input type="text" id="t_class" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input type="text" id="t_phone" class="form-control" value="+998" required>
                    </div>
                    <div class="form-group">
                        <label>Login</label>
                        <input type="text" id="t_login" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Parol</label>
                        <input type="text" id="t_pass" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Saqlash</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('addTeacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            full_name: document.getElementById('t_name').value,
            subject: document.getElementById('t_sub').value,
            class_name: document.getElementById('t_class').value,
            phone: document.getElementById('t_phone').value,
            login: document.getElementById('t_login').value,
            password: document.getElementById('t_pass').value
        };

        const res = await fetch('/api/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const resData = await res.json();
        if(res.ok) {
            showToast(resData.message, 'success');
            ModalContainer.innerHTML='';
            renderAdminTeachers();
        } else {
            showToast(resData.message || resData.errors[0].msg, 'error');
        }
    });
}

async function deleteTeacher(id) {
    if(confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
        const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
        if(res.ok) {
            showToast("O'chirildi", 'success');
            renderAdminTeachers();
        }
    }
}

async function resetTeacherPass(id) {
    const newPass = prompt("Yangi parolni kiriting:");
    if(newPass) {
        const res = await fetch(`/api/teachers/${id}/reset-pass`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: newPass })
        });
        if(res.ok) showToast("Parol yangilandi", 'success');
    }
}

async function renderAdminStudents() {
    showLoading();
    try {
        const res = await fetch('/api/students');
        const students = await res.json();
        
        let html = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                <h3>Barcha O'quvchilar</h3>
                <input type="text" id="searchIHR" class="form-control" placeholder="IHR bo'yicha qidirish" style="width:200px" onkeyup="filterStudents(this.value)">
            </div>
        `;

        const renderTableRows = (arr) => arr.map(s => `
            <tr class="student-row" data-ihr="${s.ihr}">
                <td>${s.first_name} ${s.last_name}</td>
                <td>${s.ihr}</td>
                <td>${new Date(s.birth_date).toLocaleDateString()}</td>
                <td>${s.parent_phone}</td>
            </tr>
        `).join('');

        const renderCards = (arr) => arr.map(s => `
            <div class="data-card student-row" data-ihr="${s.ihr}">
                <div class="data-card-header">
                    <span>${s.first_name} ${s.last_name}</span>
                </div>
                <div class="data-card-body">
                    <p><strong>IHR:</strong> ${s.ihr}</p>
                    <p><strong>Tug'ilgan:</strong> ${new Date(s.birth_date).toLocaleDateString()}</p>
                    <p><strong>Tel:</strong> ${s.parent_phone}</p>
                </div>
            </div>
        `).join('');

        html += `<table class="desktop-table">
            <thead>
                <tr>
                    <th>F.I.Sh</th>
                    <th>IHR</th>
                    <th>Tug'ilgan sana</th>
                    <th>Ota-ona Tel</th>
                </tr>
            </thead>
            <tbody>${renderTableRows(students)}</tbody>
        </table>`;

        html += `<div class="mobile-cards">${renderCards(students)}</div>`;

        App.innerHTML = getLayoutTemplate(html, 'O\'quvchilar', 'students');
    } catch (e) {
        showToast("Xato", "error");
    }
}

function filterStudents(ihr) {
    const rows = document.querySelectorAll('.student-row');
    rows.forEach(r => {
        if(r.dataset.ihr.includes(ihr)) r.style.display = '';
        else r.style.display = 'none';
    });
}

function renderAdminProfile() {
    const html = `
        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <h3>Sozlamalar</h3>
            <form id="adminProfileForm" style="margin-top:20px;">
                <div class="form-group">
                    <label>Joriy parol</label>
                    <input type="password" id="curr_pass" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Yangi Login</label>
                    <input type="text" id="new_login" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Yangi Parol</label>
                    <input type="password" id="new_pass" class="form-control" required onkeyup="updatePassStrength(this.value)">
                    <div class="password-strength" id="pass_strength"></div>
                    <div class="password-text" id="pass_text"></div>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%">O'zgartirish</button>
            </form>
        </div>
    `;
    App.innerHTML = getLayoutTemplate(html, 'Profil', 'profile');

    document.getElementById('adminProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('curr_pass').value;
        const newLogin = document.getElementById('new_login').value;
        const newPassword = document.getElementById('new_pass').value;

        const res = await fetch('/api/admin/credentials', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newLogin, newPassword })
        });
        const resData = await res.json();
        if(res.ok) {
            showToast(resData.message, 'success');
            setTimeout(() => logout(), 2000);
        } else {
            showToast(resData.message, 'error');
        }
    });
}

function updatePassStrength(val) {
    const elStr = document.getElementById('pass_strength');
    const elTxt = document.getElementById('pass_text');
    if(!val) {
        elStr.className = 'password-strength';
        elTxt.innerText = '';
        return;
    }
    const info = checkPasswordStrength(val);
    elStr.className = 'password-strength ' + info.strength;
    elTxt.innerText = info.text;
}
