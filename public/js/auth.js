// Login UI
function renderLogin() {
    App.innerHTML = `
        <div class="login-container">
            <div class="card login-box">
                <h2 class="login-header">Tizimga kirish</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Login</label>
                        <input type="text" id="login" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Parol</label>
                        <input type="password" id="password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Kirish</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('role', data.role);
                currentUserRole = data.role;
                showToast(data.message, 'success');
                renderPage();
            } else {
                showToast(data.message || data.errors[0].msg, 'error');
            }
        } catch (err) {
            showToast("Tarmoq xatosi", 'error');
        }
    });
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    localStorage.removeItem('role');
    currentUserRole = null;
    renderPage();
}

function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength = '';
    let text = '';
    if (score < 3) { strength = 'strength-weak'; text = 'Zaif'; }
    else if (score === 3) { strength = 'strength-medium'; text = 'O\'rtacha'; }
    else if (score === 4) { strength = 'strength-strong'; text = 'Kuchli'; }
    else { strength = 'strength-very-strong'; text = 'Juda kuchli'; }

    return { strength, text, score };
}
