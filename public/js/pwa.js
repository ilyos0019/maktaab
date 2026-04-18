if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker ro\'yxatdan o\'tdi', reg))
            .catch(err => console.error('Service Worker xatosi', err));
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Agar oxirgi marta yopganidan 7 kun o'tmagan bo'lsa, ko'rsatmaslik mumkin
    // Hozircha doim ko'rsatamiz:
    showInstallBanner();
});

function showInstallBanner() {
    // Banner yasash va ko'rsatish mantig'i app.js da UI ga qarab chaqirilishi mumkin.
    // Misol uchun oddiy toast chiqaramiz:
    const div = document.createElement('div');
    div.id = "pwa-install-banner";
    div.style.cssText = "position:fixed; bottom:80px; left:20px; right:20px; background:#0F6E56; color:white; padding:15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; z-index:9999;";
    div.innerHTML = `
        <span>Ilovani telefoningizga o'rnating!</span>
        <div>
            <button id="btn-install" style="background:white; color:#0F6E56; border:none; padding:8px 12px; border-radius:5px; margin-right:10px;">O'rnatish</button>
            <button id="btn-close-banner" style="background:transparent; border:1px solid white; color:white; padding:8px 12px; border-radius:5px;">Yopish</button>
        </div>
    `;
    document.body.appendChild(div);

    document.getElementById('btn-install').addEventListener('click', async () => {
        div.remove();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
        }
    });

    document.getElementById('btn-close-banner').addEventListener('click', () => {
        div.remove();
        // localStorage ga yozib qoyish mumkun 7 kun chiqmasligi uchun
    });
}

// iOS Safari ko'rsatmasi
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
}
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

if (isIos() && !isInStandaloneMode()) {
    // IOS uchun toast chiqarish mumkin "Ulashish -> Bosh ekranga qo'shish" 
}
