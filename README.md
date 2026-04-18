# Maktab Boshqaruv Tizimi (PWA)

Bu loyiha Maktab o'qituvchilari va o'quvchilarini boshqarish uchun PWA ilovasi hisoblanadi.

## Texnologiyalar
- **Frontend:** HTML5, CSS3, Vanilla JS, PWA (Service Worker, manifest), IndexedDB.
- **Backend:** Node.js, Express.js.
- **Baza:** PostgreSQL.
- **Xavfsizlik:** JWT, bcrypt, helmet, express-rate-limit.

## O'rnatish Qadamlari

### 1. Ma'lumotlar bazasini sozlash (PostgreSQL)

**Agar Docker bo'lsa (Tavsiya etiladi):**
Loyiha papkasida ushbu buyruqni bering:
```bash
docker-compose up -d
```
*Bu komanda avtomatik ravishda PostgreSQL ni ko'taradi va `schema.sql` dagi ma'lumotlarni yozadi.*

**Agar mahalliy PostgreSQL bo'lsa:**
1. PostgreSQL serverni yoqing.
2. `maktab_db` nomli baza yarating.
3. Loyihadagi `schema.sql` fayli ichidagi barcha SQL kodlarni shu bazaga kiriting (Admin ham avtomat yaratiladi).

### 2. Environment (Muhit) o'zgaruvchilari
`.env.example` faylidan `.env` nusxasini yarating va PostgreSQL parolingizni to'g'rilang.
`.env` fayl namunasi:
```
DATABASE_URL=postgresql://postgres:PAROL@localhost:5432/maktab_db
JWT_SECRET=maktab_super_secret_2025!
PORT=3000
NODE_ENV=production
ALLOWED_ORIGIN=http://localhost:3000
```

### 3. Paketlarni o'rnatish va ishga tushirish
Loyihada Node.js o'rnatilganligiga ishonch hosil qiling.
```bash
npm install
npm start
```
Loyihani brauzerda oching: `http://localhost:3000`

### 4. Test uchun login ma'lumotlari
- **Admin Login:** `admin`
- **Admin Parol:** `Admin@123!`

### 5. Telefonga PWA o'rnatish
1. **Android:** Brauzerda oching (masalan, Chrome), pastda o'rnatish taklifi chiqadi, yoki "Add to Home Screen" qiling.
2. **iPhone:** Safari orqali oching -> Ulashish (Share) tugmasi -> "Add to Home Screen" qiling.

### 6. Railway ga Deploy qilish (Ma'lumot uchun)
1. GitHub ga kodingizni yuklang.
2. Railway.app da "New Project" -> "Deploy from GitHub repo".
3. Add Plugin -> PostgreSQL ni qo'shing.
4. "Variables" bo'limida Railway bergan `DATABASE_URL` ni va `JWT_SECRET` ni qo'shing.
5. PWA to'g'ri ishlashi uchun `ALLOWED_ORIGIN` ga Railway domenini (yoki ulangan shaxsiy domenni) yozib qo'ying.