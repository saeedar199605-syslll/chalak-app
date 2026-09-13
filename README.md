# سامانه جامع ارزیابی عملکرد و کوچینگ هوشمند پرسنل (Chalak Performance)
## نسخه معماری ابری Cloudflare (Workers + D1 + Durable Objects + R2 + React)

این پروژه بازطراحی و ارتقای کامل سامانه ارزیابی عملکرد سازمانی کارخانجات اصفهان چالاک (هلدینگ گیتی‌پسند) است که از معماری تک‌کاربره مبتنی بر `localStorage` به یک سامانه توزیع‌شده، مقیاس‌پذیر، فوق‌سریع و با امنیت سازمانی بر بستر **Cloudflare Edge** مهاجرت داده شده است.

---

### ۱. معماری کلی سامانه (Architecture Overview)

```
[ Frontend: React 19 + TypeScript + Vite + Tailwind CSS ]
                         │
                         │ HTTP / REST (JWT in HttpOnly Cookie)
                         ▼
[ Edge Gateway: Cloudflare Workers + Hono Router ]
     │                │                 │                │
     ▼                ▼                 ▼                ▼
[ D1 Database ]  [ Real-Time DO ]   [ R2 Storage ]   [ Gemini 2.5 ]
(Relational SQL) (WebSockets Sync)  (Encrypted Vault) (Secure Backend)
```

1. **Frontend**:
   - توسعه داده شده با React 19 و TypeScript بر بستر Vite.
   - استفاده از **TanStack Query (v5)** برای کش‌گذاری هوشمند در کلاینت، Optimistic Updates و Invalidation سریع.
   - مدیریت وضعیت سراسری نشست و کاربر با **Zustand**.
   - پشتیبانی ۱۰۰٪ استاندارد از زبان فارسی و جهت راست‌به‌چپ (RTL).
   - خرد کردن God Componentهای پیشین (بالای ۱۰۰۰ خط) به کامپوننت‌ها و هوک‌های ماژولار زیر ۳۰۰ خط.

2. **Backend**:
   - مبتنی بر **Cloudflare Workers** با فریم‌ورک سریع و سبک **Hono**.
   - خذف کامل وابستگی به سرورهای سنگین Express سنتی در محیط ابری.
   - اعتبارسنجی ورودی‌ها با Zod و مدیریت متمرکز خطا با کدهای استاندارد HTTP.

3. **Database (Cloudflare D1)**:
   - دیتابیس رابطه‌ای SQLite توزیع‌شده با مایگریشن‌های نسخه‌بندی‌شده.
   - اعمال Foreign Keyهای سخت‌گیرانه، Indexهای اختصاصی روی کدهای پرسنلی و دوره‌ها.
   - مدیریت همزمانی با قفل خوش‌بینانه (Optimistic Concurrency Control با فیلد `version`).

4. **Real-Time Synchronization (Cloudflare Durable Objects & WebSockets)**:
   - هماهنگ‌کننده اتاق کاری (`WorkspaceRoom`) به ازای هر سازمان/ورک‌اسپیس.
   - توزیع لحظه‌ای رویدادهای تغییرات ارزیابی‌ها بدون نیاز به رفرش صفحه.
   - سیستم تشخیص رویداد تکراری (Idempotent Event Handling) و Reconnect خودکار با بافر ۵۰ رویداد اخیر.

5. **File Vault & Backup (Cloudflare R2)**:
   - ذخیره‌سازی پشتیبان‌های دوره‌ای دیتابیس و خروجی‌های اکسل در باکت ابری R2.
   - عدم ذخیره فایلهای حجیم در جداول D1.

6. **Gemini AI Integration**:
   - ایزوله‌سازی کامل کلید هوش مصنوعی (`GEMINI_API_KEY`) در Cloudflare Secrets.
   - عدم افشای هرگونه کلید به مرورگر کلاینت.
   - اعتبارسنجی خروجی ساختاریافته (Strengths, Development Areas, Action Items, Conversation Guide).

---

### ۲. پیش‌نیازها و نصب

- **Node.js**: نسخه 18.20 یا بالاتر
- **Wrangler CLI**: نسخه 3 یا بالاتر (`npm install -g wrangler`)

#### نصب وابستگی‌ها:
```bash
npm install
```

---

### ۳. اجرای محیط توسعه محلی (Local Development)

#### اجرای بک‌اند ورکر همراه با D1 و Durable Objects محلی:
```bash
# اجرای مایگریشن‌های دیتابیس روی محیط لوکال
npm run d1:migrate:local

# بارگذاری داده‌های اولیه دمو (Seed Data)
npm run d1:seed:local

# اجرای ورکر ابری در پورت ۸۷۸۷
npm run dev:worker
```

#### اجرای فرانت‌اند ری‌اکت:
```bash
npm run dev
```
سامانه در آدرس `http://localhost:5173` با پراکسی خودکار به ورکر لوکال در دسترس خواهد بود.

---

### ۴. استقرار در محیط واقعی (Production Deployment)

#### گام ۱: ساخت دیتابیس D1 و باکت R2 در کلودفلر
```bash
# ایجاد دیتابیس D1
wrangler d1 create chalak_performance_db

# ایجاد باکت R2
wrangler r2 bucket create chalak-performance-vault
```
*شناسه دیتابیس بازگردانده شده را در `wrangler.jsonc` داخل بخش `database_id` وارد نمایید.*

#### گام ۲: تنظیم Secretهای امنیتی
```bash
wrangler secret put JWT_SECRET
wrangler secret put GEMINI_API_KEY
```

#### گام ۳: اجرای مایگریشن‌ها در پروداکشن
```bash
wrangler d1 migrations apply DB --remote
wrangler d1 execute DB --remote --file=worker/migrations/0002_seed_data.sql
```

#### گام ۴: بیلد و دیپلوی کامل
```bash
npm run deploy
```

---

### ۵. اطلاعات ورود پیش‌فرض (Demo Accounts)

| نام کاربری | کلمه عبور | نقش | سطح دسترسی |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `admin` | دسترسی نامحدود به تمامی منوها، فرمول‌ها، بک‌آپ و کاربران |
| `supervisor` | `supervisor123` | `manager` | نمره‌دهی پرسنل واحد، مشاهده گزارش‌های کالیبراسیون و ۹ خانه |
| `hr` | `hr123` | `hr` | مدیریت پرسنل، تعریف شاخص‌ها، اوزان و کالیبراسیون |
| `emp1` | `emp123` | `employee` | خودارزیابی پرسنل و مشاهده وضعیت کارنامه فردی |

---

### ۶. اجرای تست‌ها
```bash
npm run test
```
تست‌های Unit تمامی توابع ارزیابی عملکرد، اعتبارسنجی اوزان، کنترل وتوی ایمنی S-01، ماتریس ۹ خانه و شاخص کالیبراسیون Z-Score را با موفقیت بررسی می‌کنند.
