# Yalla Admin

لوحة تحكم تجريبية مبنية بـ Next.js App Router لإدارة منتجات وطلبات Yalla Market. المشروع يحتوي على تسجيل دخول تجريبي، API محمية، تخزين SQLite عبر Prisma، وتجارب موبايل محسنة للجداول.

## المتطلبات

- Node.js 20+
- npm 10+

## التشغيل

```bash
npm install
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

Demo auth is only for this dashboard preview. There is no real backend user
database, hashed password storage, or roles system yet. Configure the demo
password and session signing secret with environment variables:

```bash
DASHBOARD_DEMO_PASSWORD=01266666610
SESSION_SECRET=replace-with-a-strong-random-secret
```

`SESSION_SECRET` is required and the app will throw a clear error in production
when it is missing.

## قاعدة البيانات

يستخدم المشروع Prisma مع SQLite. ملف قاعدة البيانات المحلي ينشأ تلقائيا عند أول طلب API:

```text
prisma/dev.db
```

أوامر مفيدة:

```bash
npm run db:generate
npm run db:studio
```

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
