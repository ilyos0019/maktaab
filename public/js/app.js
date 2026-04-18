// Global holat va UI funksiyalar
let currentUserRole = localStorage.getItem('role') || null;

const App = document.getElementById('app');
const ModalContainer = document.getElementById('modal-container');
const ToastContainer = document.getElementById('toast-container');

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    ToastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading Spinner
function showLoading() {
    App.innerHTML = '<div class="spinner"></div>';
}

// Router
function renderPage() {
    if (!currentUserRole) {
        renderLogin();
    } else if (currentUserRole === 'admin') {
        renderAdminDashboard();
    } else if (currentUserRole === 'teacher') {
        renderTeacherDashboard();
    }
}

// Layout yasash (Desktop + Mobile uchun)
function getLayoutTemplate(contentHtml, title, activeTab) {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        return `
            <div class="layout-container">
                <div class="topbar">
                    <div class="topbar-title">${title}</div>
                    <button class="btn btn-outline" style="color:white; border-color:white;" onclick="logout()">Chiqish</button>
                </div>
                <div class="content-area">${contentHtml}</div>
                <div class="bottom-nav">
                    <div class="nav-item ${activeTab==='home'?'active':''}" onclick="navigate('home')">
                        <span class="nav-icon">🏠</span><span>Bosh sahifa</span>
                    </div>
                    ${currentUserRole === 'admin' ? `
                    <div class="nav-item ${activeTab==='teachers'?'active':''}" onclick="navigate('teachers')">
                        <span class="nav-icon">👨‍🏫</span><span>Ustozlar</span>
                    </div>
                    ` : ''}
                    <div class="nav-item ${activeTab==='students'?'active':''}" onclick="navigate('students')">
                        <span class="nav-icon">👨‍🎓</span><span>O'quvchilar</span>
                    </div>
                    <div class="nav-item ${activeTab==='profile'?'active':''}" onclick="navigate('profile')">
                        <span class="nav-icon">⚙️</span><span>Profil</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="layout-container">
                <div class="sidebar">
                    <div class="sidebar-header">Maktab Tizimi</div>
                    <div class="sidebar-nav">
                        <div class="sidebar-item ${activeTab==='home'?'active':''}" onclick="navigate('home')">🏠 Bosh sahifa</div>
                        ${currentUserRole === 'admin' ? `
                        <div class="sidebar-item ${activeTab==='teachers'?'active':''}" onclick="navigate('teachers')">👨‍🏫 Ustozlar</div>
                        ` : ''}
                        <div class="sidebar-item ${activeTab==='students'?'active':''}" onclick="navigate('students')">👨‍🎓 O'quvchilar</div>
                        <div class="sidebar-item ${activeTab==='profile'?'active':''}" onclick="navigate('profile')">⚙️ Profil</div>
                    </div>
                    <div class="sidebar-footer">
                        <button class="btn btn-danger w-100" style="width:100%" onclick="logout()">Tizimdan chiqish</button>
                    </div>
                </div>
                <div class="main-content">
                    <div class="topbar">
                        <div class="topbar-title">${title}</div>
                        <div class="user-info">${currentUserRole === 'admin' ? 'Admin' : 'Ustoz'}</div>
                    </div>
                    <div class="content-area">${contentHtml}</div>
                </div>
            </div>
        `;
    }
}

// Navigatsiya
function navigate(tab) {
    if(currentUserRole === 'admin') {
        if(tab === 'home') renderAdminDashboard();
        if(tab === 'teachers') renderAdminTeachers();
        if(tab === 'students') renderAdminStudents();
        if(tab === 'profile') renderAdminProfile();
    } else {
        if(tab === 'home' || tab === 'students') renderTeacherStudents();
        if(tab === 'profile') renderTeacherProfile();
    }
}

// Oflayn tekshiruvi
window.addEventListener('online', async () => {
    document.getElementById('offline-banner').classList.add('hidden');
    showToast("Internet ulanishi tiklandi!", "success");
    // Sync queue
    const queue = await getSyncQueue();
    if(queue && queue.length > 0) {
        showToast(`${queue.length} ta ma'lumot sinxron qilinmoqda...`, "warning");
        // API chaqirib yuborish kerak barchasini loop qilib
        // Buni auth.js/api fayllar orqali qilamiz. Hozircha tozalaymiz.
        for(let q of queue) {
           await window.submitStudentData(q);
        }
        await clearSyncQueue();
        showToast(`Sinxronizatsiya tugadi.`, "success");
        navigate(currentUserRole === 'admin' ? 'students' : 'home');
    }
});

window.addEventListener('offline', () => {
    document.getElementById('offline-banner').classList.remove('hidden');
});

// Boshlang'ich yuklash
document.addEventListener('DOMContentLoaded', renderPage);
