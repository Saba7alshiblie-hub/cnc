# 🏥 العيادة العلمية - نظام إدارة المرضى

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA: Yes](https://img.shields.io/badge/PWA-Yes-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![RTL: Supported](https://img.shields.io/badge/RTL-Supported-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/API/CSS/dir)

تطبيق ويب متقدم وتطبيق محمول (PWA + APK) شامل لإدارة العيادة والمرضى مع تتبع الزيارات والعلاجات والبيانات الطبية.

## ✨ المميزات الرئيسية

### تطبيق ويب متقدم (PWA)
- ✅ **Progressive Web App** - يعمل بدون اتصال إنترنت
- ✅ **Offline Support** - صفحات بديلة عند فقدان الاتصال
- ✅ **Service Worker** - تخزين مؤقت ذكي للموارد
- ✅ **Push Notifications** - إشعارات فورية للمواعيد والتحديثات
- ✅ **Installable** - يمكن تثبيته كتطبيق على الهاتف

### واجهة المستخدم
- 🌐 **دعم كامل للعربية** - واجهة RTL محسّنة
- 📱 **متجاوب تماماً** - يعمل على جميع أحجام الشاشات
- 🎨 **تصميم حديث** - واجهة جميلة وسهلة الاستخدام
- ♿ **Accessible** - متوافق مع معايير الوصولية WCAG
- 🌙 **Dark Mode** - وضع مظلم قابل للتبديل

### الأداء والأمان
- ⚡ **تحميل سريع** - كاش ذكي وضغط مزدوج
- 🔒 **آمن** - تشفير البيانات المحلية و HTTPS فقط
- 📊 **Analytics** - تتبع الاستخدام مع Google Analytics
- 🔄 **SEO Optimized** - محسّن لمحركات البحث مع Structured Data
- 🛡️ **Content Security Policy** - حماية متقدمة من الثغرات الأمنية

### الوظائف الطبية
- 👥 **إدارة المرضى** - بيانات شاملة لكل مريض
- 📅 **تتبع الزيارات** - سجل كامل للزيارات والعلاجات
- 💓 **قياس ضغط الدم** - تتبع وتصنيف تلقائي
- 🩸 **مراقبة سكر الدم** - تسجيل القراءات والأوقات
- 🩹 **الحجامة** - جدولة المواعيد وتذكير تلقائي
- 📄 **تقارير طبية** - طباعة السجلات الطبية
- 📤 **تصدير البيانات** - نسخ احتياطي للبيانات

## 🆕 التحسينات الأخيرة

### الإصدار 2.0 - تحسينات شاملة
- 🔧 **هيكلة الكود** - فصل الوظائف إلى ملفات منفصلة (utils.js, auth.js, ui.js, visits.js, data.js)
- 🌙 **الوضع المظلم** - تبديل بين الوضع الفاتح والمظلم مع حفظ التفضيل
- ♿ **إمكانية الوصول** - إضافة ARIA labels ودعم قارئات الشاشة
- 🔍 **SEO محسّن** - إضافة Structured Data وMeta Tags شاملة
- 🛡️ **أمان متقدم** - Content Security Policy وتشفير محسن
- 📱 **أداء محسّن** - Lazy Loading وتحسينات الأداء
- 💾 **تصدير البيانات** - نسخ احتياطي للبيانات بتنسيق JSON
- 🔔 **إشعارات محسّنة** - نظام إشعارات أفضل للمواعيد والتذكيرات

## 📁 هيكل المشروع

```
cnc/
├── index.html           # الصفحة الرئيسية (التطبيق الكامل)
├── offline.html         # صفحة بديلة عند فقدان الاتصال
├── 404.html             # صفحة الخطأ
├── manifest.json        # ملف تعريف التطبيق
├── sw.js                # Service Worker للتخزين المؤقت
├── robots.txt           # ملف تعليمات محركات البحث
├── sitemap.xml          # خريطة الموقع لـ SEO
├── .htaccess            # إعدادات الخادم
├── utils.js             # دوال مساعدة (تنسيق التاريخ، الإشعارات، الوضع المظلم)
├── auth.js              # إدارة المصادقة والجلسات
├── ui.js                # إدارة واجهة المستخدم والعرض
├── visits.js            # إدارة الزيارات والقياسات الطبية
├── data.js              # إدارة البيانات والمزامنة
├── .well-known/
│   └── security.txt     # ملف الأمان
├── my-new-icon-192.png  # أيقونة 192x192
├── my-new-icon-512.png  # أيقونة 512x512
└── logo.png             # شعار التطبيق
```

## 🚀 البدء السريع

### 1. الاستخدام على الويب
انسخ الملفات إلى خادمك (يفضل HTTPS):
```bash
# استضافة محلية للتطوير
python -m http.server 8000
# أو
npx http-server
```

### 2. تثبيت كتطبيق
- **على الويب**: اضغط على زر "إضافة إلى الشاشة الرئيسية"
- **على Android**: استخدم متصفح Chrome وحول الـ PWA إلى APK

### 3. تحويل إلى APK

#### باستخدام Bubblewrap:
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://your-domain.com/manifest.json
bubblewrap build
# افتح المشروع الناتج في Android Studio
```

#### باستخدام PWABuilder:
1. افتح https://pwabuilder.com
2. أدخل رابط موقعك
3. حمل ملفات البناء لـ Android

#### باستخدام Capacitor:
```bash
npm init @capacitor/app
npx cap add android
npx cap open android
```

## 📱 المتطلبات الفنية

### للويب:
- HTTPS (إلزامي للـ PWA والـ Service Worker)
- JavaScript مُفعّل
- localStorage/IndexedDB للبيانات المحلية

### لـ Android APK:
- Android 5.0 (API 21) فما فوق
- 50 MB مساحة تخزين

### للـ iOS:
- iOS 13.4 فما فوق

## 🔧 التحسينات المطبقة

### SEO و Meta Tags
- ✅ Open Graph tags للشبكات الاجتماعية
- ✅ Twitter Card tags
- ✅ Description و Keywords
- ✅ Canonical URLs
- ✅ Schema.org microdata (جاهز للإضافة)

### الأداء
- ✅ Load font with `font-display: swap`
- ✅ SRI (Subresource Integrity) لمكتبات خارجية
- ✅ GZIP compression
- ✅ بطاقة مؤقتة ذكية (Cache Busting)
- ✅ Lazy loading للصور

### الأمان
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ CORS headers

### الوصولية
- ✅ ARIA labels على جميع الأزرار
- ✅ Semantic HTML
- ✅ Keyboard navigation
- ✅ Color contrast WCAG AA

### دعم Offline
- ✅ Service Worker مع استراتيجيات ذكية
- ✅ صفحة offline.html بديلة
- ✅ Background Sync (جاهز)
- ✅ Periodic Sync (جاهز)

## 📝 ملفات كمثال للتكوين

### متطلبات Google Analytics
استبدل `G-XXXXXXXXXX` في index.html بـ Tracking ID الخاص بك:
```javascript
gtag('config', 'G-YOUR-ID');
```

### تحديث الروابط
استبدل جميع روابط:
- `https://ilmiyya-clinic.app/` بـ نطاقك الفعلي
- Firebase DB URL بـ قاعدة البيانات الخاصة بك
- البريد الإلكتروني support@ilmiyya-clinic.app في security.txt

## 🌐 الاستضافة الموصى بها

### خيارات مجانية:
- **Firebase Hosting** - مع Firebase Realtime DB
- **Netlify** - مع CDN سريع
- **Vercel** - لـ Next.js (إن أضفت)
- **GitHub Pages** - بسيط وسهل

### خيارات مدفوعة:
- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Azure Static Web Apps**

## 📊 الأداء المتوقع

مع التحسينات المطبقة:
- ⏱️ **First Paint**: < 1s
- ✨ **First Contentful Paint**: < 1.5s
- ⚡ **Largest Contentful Paint**: < 2.5s
- 🎯 **Lighthouse Score**: 90+

## 🔐 الأمان

التطبيق يتبع أفضل الممارسات:
- ✅ HTTPS فقط
- ✅ Content Security Policy (CSP) - جاهز للإضافة
- ✅ No inline scripts (يمكن تحسينه أكثر)
- ✅ CORS properly configured
- ✅ Error pages بدون معلومات حساسة

## 📱 الأجهزة المدعومة

| الجهاز | الدعم | الملاحظات |
|------|------|---------|
| iPhone | ✅ | Safari 13.4+ |
| Android | ✅ | Chrome, Firefox |
| iPad | ✅ | iOS 13.4+ |
| Desktop | ✅ | جميع المتصفحات الحديثة |

## 📞 الدعم والاتصال

للإبلاغ عن مشاكل أو الحصول على الدعم:
- 📧 البريد: support@ilmiyya-clinic.app
- 🐛 المشاكل: [GitHub Issues](https://github.com/Saba7alshiblie-hub/cnc/issues)
- 💬 النقاشات: [GitHub Discussions](https://github.com/Saba7alshiblie-hub/cnc/discussions)

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

## 🙏 الشكر والتقدير

شكراً لاستخدام هذا التطبيق!

---

**آخر تحديث**: مارس 2026  
**الإصدار**: 1.0.0 - Release

