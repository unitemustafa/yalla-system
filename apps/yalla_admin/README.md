# Yalla Admin

لوحة تحكم مبنية بـ Next.js App Router لإدارة منتجات وطلبات Yalla Market. تسجيل الدخول والبيانات يتصلان بباك Django REST API عبر JWT، وتجارب الجداول محسنة للموبايل.

## المتطلبات

- Node.js 20+
- npm 10+

## التشغيل

```bash
npm install
cp .env.example .env
npm run dev
```

افتح:

```text
http://localhost:3000
```

بيانات الدخول التجريبية:

```text
Email: dashboard@admin.com
Password: 01266666610
```

For backend mode, sign in with a real active Django user whose role is included
in `DASHBOARD_ALLOWED_ROLES`.

Dashboard auth uses the Django backend by default. Configure the backend URL,
allowed dashboard roles, and session signing secret with environment variables:

```bash
BACKEND_API_BASE_URL=http://127.0.0.1:8000/api/v1
DASHBOARD_AUTH_MODE=backend
DASHBOARD_ALLOWED_ROLES=admin
SESSION_SECRET=replace-with-a-strong-random-secret
```

`SESSION_SECRET` is required and the app will throw a clear error in production
when it is missing.

Demo auth is still available for smoke/e2e previews by setting:

```bash
DASHBOARD_AUTH_MODE=demo
DASHBOARD_DEMO_PASSWORD=01266666610
```

## البيانات

الداشبورد لا تتصل بقاعدة البيانات مباشرة. كل عمليات المنتجات والطلبات تمر عبر Django REST API تحت `/api/v1/dashboard/`، وقاعدة البيانات وإدارتها مسؤولية الباك فقط.

## الصور والأداء

الصور الخارجية مسموحة من `bucket.ammenu.com` داخل `next.config.ts`، ويتم استخدام `next/image` بدون `unoptimized` حتى يستفيد التطبيق من:

- اختيار أحجام مناسبة حسب الجهاز.
- صيغ حديثة مثل WebP وAVIF.
- تقليل layout shift عبر أبعاد ثابتة للصور.

## الاختبارات

تشغيل الفحص:

```bash
npm run lint
```

تشغيل smoke test للـ API:

```bash
npm run smoke
```

الـ smoke test يشغل dev server تلقائيا لو لم يكن يعمل، ثم يتحقق من:

- حماية API بدون جلسة.
- تسجيل الدخول الصحيح والخاطئ.
- جلب المنتجات والطلبات.
- تعديل منتج وإرجاعه لحالته.
- نسخ منتج ثم حذف النسخة.
- تعديل حالة طلب وإرجاعها.

تشغيل اختبارات e2e:

```bash
npm run e2e
```

اختبارات e2e تستخدم Playwright وتغطي:

- إعادة توجيه الروتات المحمية إلى صفحة الدخول.
- تحميل صفحات المنتجات والطلبات بعد تسجيل الدخول عبر API.
- ظهور الجداول الكاملة على الديسكتوب.
- ظهور cards مختصرة على الموبايل بدون overflow أفقي.

للتشغيل بواجهة مرئية:

```bash
npm run e2e:headed
```

## أهم المسارات

- `/login`
- `/dashboard`
- `/items`
- `/orders`
- `/api/auth/login`
- `/api/dashboard/items`
- `/api/dashboard/orders`
