async function renderTeacherDashboard() {
    renderTeacherStudents();
}

async function fetchStudents() {
    try {
        const res = await fetch('/api/students');
        if (res.ok) {
            const students = await res.json();
            // Keshlash
            await saveStudentsLocal(students);
            return students;
        }
        throw new Error("Network response was not ok.");
    } catch (e) {
        // Oflayn bo'lsa IndexedDB dan olish
        return await getStudentsLocal();
    }
}

async function renderTeacherStudents() {
    showLoading();
    try {
        const students = await fetchStudents();
        
        let html = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 20px; align-items:center;">
                <h3>O'quvchilarim</h3>
                <button class="btn btn-primary" onclick="showAddStudentModal()">+ Qo'shish</button>
            </div>
            <input type="text" id="searchIHR" class="form-control" placeholder="IHR bo'yicha qidirish" style="margin-bottom:20px;" onkeyup="filterStudents(this.value)">
        `;

        const renderCards = (arr) => arr.map(s => `
            <div class="data-card student-row" data-ihr="${s.ihr}">
                <div class="data-card-header">
                    <span>${s.first_name} ${s.last_name}</span>
                    <button class="btn" style="background:transparent; color:var(--danger); padding:0; min-height:auto;" onclick="deleteStudent(${s.id})">🗑</button>
                </div>
                <div class="data-card-body">
                    <p><strong>IHR:</strong> ${s.ihr}</p>
                    <p><strong>Tug'ilgan:</strong> ${new Date(s.birth_date).toLocaleDateString()}</p>
                    <p><strong>Ota:</strong> ${s.father_name}</p>
                    <p><strong>Ona:</strong> ${s.mother_name}</p>
                    <p><strong>Tel:</strong> ${s.parent_phone}</p>
                </div>
            </div>
        `).join('');

        // O'qituvchilar ko'proq mobildan kirishi mumkin shuning uchun faqat karta dizayni.
        html += `<div class="mobile-cards" style="display:block;">${renderCards(students)}</div>`;

        App.innerHTML = getLayoutTemplate(html, 'O\'quvchilar', 'students');
    } catch (e) {
        showToast("Xato yuz berdi", "error");
    }
}

function showAddStudentModal() {
    ModalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close" onclick="ModalContainer.innerHTML=''">×</button>
                <h3 style="margin-bottom:20px;">Yangi o'quvchi</h3>
                <form id="addStudentForm">
                    <h4 style="margin: 10px 0; color:var(--primary)">Shaxsiy</h4>
                    <div class="form-group"><input type="text" id="s_fname" class="form-control" placeholder="Ismi*" required></div>
                    <div class="form-group"><input type="text" id="s_lname" class="form-control" placeholder="Familyasi*" required></div>
                    <div class="form-group"><input type="date" id="s_bdate" class="form-control" required></div>
                    <div class="form-group"><input type="text" id="s_ihr" class="form-control" placeholder="IHR (14 ta raqam)*" maxlength="14" pattern="\\d{14}" required></div>
                    
                    <h4 style="margin: 10px 0; color:var(--primary)">Ota</h4>
                    <div class="form-group"><input type="text" id="f_name" class="form-control" placeholder="Ota ismi*" required></div>
                    <div class="form-group"><input type="text" id="f_sname" class="form-control" placeholder="Ota familyasi"></div>
                    <div class="form-group"><input type="text" id="f_work" class="form-control" placeholder="Ish joyi"></div>

                    <h4 style="margin: 10px 0; color:var(--primary)">Ona</h4>
                    <div class="form-group"><input type="text" id="m_name" class="form-control" placeholder="Ona ismi*" required></div>
                    <div class="form-group"><input type="text" id="m_sname" class="form-control" placeholder="Ona familyasi"></div>
                    <div class="form-group"><input type="text" id="m_work" class="form-control" placeholder="Ish joyi"></div>

                    <h4 style="margin: 10px 0; color:var(--primary)">Qo'shimcha</h4>
                    <div class="form-group"><input type="text" id="p_phone" class="form-control" placeholder="Tel: +998 xx xxx xx xx"></div>
                    <div class="form-group"><input type="text" id="address" class="form-control" placeholder="Manzil"></div>
                    <div class="form-group"><textarea id="notes" class="form-control" placeholder="Izoh..."></textarea></div>

                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px;">Saqlash</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            first_name: document.getElementById('s_fname').value,
            last_name: document.getElementById('s_lname').value,
            birth_date: document.getElementById('s_bdate').value,
            ihr: document.getElementById('s_ihr').value,
            father_name: document.getElementById('f_name').value,
            father_surname: document.getElementById('f_sname').value,
            father_workplace: document.getElementById('f_work').value,
            mother_name: document.getElementById('m_name').value,
            mother_surname: document.getElementById('m_sname').value,
            mother_workplace: document.getElementById('m_work').value,
            parent_phone: document.getElementById('p_phone').value,
            address: document.getElementById('address').value,
            notes: document.getElementById('notes').value
        };

        await window.submitStudentData(data);
        ModalContainer.innerHTML='';
    });
}

// Global scope da API call shunda oflayn sync ham chaqira oladi
window.submitStudentData = async function(data) {
    if (!navigator.onLine) {
        await addToSyncQueue(data);
        showToast("Oflayn rejim. Ma'lumot navbatga qo'shildi", 'warning');
        renderTeacherStudents();
        return;
    }

    try {
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const resData = await res.json();
        if(res.ok) {
            showToast(resData.message, 'success');
            renderTeacherStudents();
        } else {
            showToast(resData.message || resData.errors[0].msg, 'error');
        }
    } catch (e) {
        // agar fetch ishlamasa baribir queue ga
        await addToSyncQueue(data);
        showToast("Oflayn rejim. Ma'lumot navbatga qo'shildi", 'warning');
        renderTeacherStudents();
    }
}

async function deleteStudent(id) {
    if(confirm("O'quvchini o'chirasizmi?")) {
        try {
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
            if(res.ok) {
                showToast("O'chirildi", 'success');
                renderTeacherStudents();
            }
        } catch(e) {
            showToast("Oflayn rejimda o'chirish mumkin emas", "error");
        }
    }
}

function renderTeacherProfile() {
    const html = `
        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <h3>Profil Sozlamalari</h3>
            <form id="teacherProfileForm" style="margin-top:20px;">
                <div class="form-group">
                    <label>Joriy parol</label>
                    <input type="password" id="curr_pass" class="form-control" required>
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

    document.getElementById('teacherProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('curr_pass').value;
        const newPassword = document.getElementById('new_pass').value;

        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
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
