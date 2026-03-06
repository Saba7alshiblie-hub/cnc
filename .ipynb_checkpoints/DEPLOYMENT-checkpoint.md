# دليل النشر والاستضافة

دليل شامل لنشر تطبيق العيادة على خوادم مختلفة والتحقق من القائمة.

## 📋 قائمة التدقيق قبل النشر

- [ ] تحديث جميع الروابط (استبدال ilmiyya-clinic.app بنطاقك)
- [ ] إضافة Google Analytics ID
- [ ] اختبار على أجهزة حقيقية
- [ ] التحقق من Lighthouse Score (90+)
- [ ] اختبار في offline mode
- [ ] تحقق من Service Worker registration
- [ ] اختبار Push Notifications
- [ ] HTTPS enabled

## 🚀 خيارات الاستضافة

### 1. Firebase Hosting (الأسهل + Firebase DB)

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init hosting

# نشر
firebase deploy
```

**المميزات:**
- مجاني للمبتدئين
- CDN سريع عالمي
- SSL/TLS مجاني
- دعم الـ SPA routing
- Analytics مدمج

**الملف المطلوب:** `firebase.json`
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "/(index.html|manifest.json|robots.txt|sitemap.xml)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      },
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 2. Netlify (بسيط وقوي)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# إنشاء موقع
netlify init

# نشر
netlify deploy --prod
```

**الملف المطلوب:** `netlify.toml`
```toml
[build]
  command = "echo 'Project is ready to deploy'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/(index.html|manifest.json|robots.txt)"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Vercel (الأسرع)

```bash
npm install -g vercel
vercel
```

**الملف المطلوب:** `vercel.json`
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/.*",
      "dest": "/index.html",
      "methods": ["GET", "HEAD"]
    },
    {
      "src": "/sw.js",
      "headers": {
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    }
  ],
  "headers": [
    {
      "source": "/(index.html|manifest.json|robots.txt|sitemap.xml)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 4. GitHub Pages (مجاني)

```bash
# Enable Pages من GitHub Settings
# Select main branch as source

# أضف إلى package.json:
"homepage": "https://username.github.io/cnc",

# Deploy
npm run build  # إن وجدت build script
git push origin main
```

### 5. Heroku (مع Backend)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create app-name

# Deploy
git push heroku main
```

### 6. استضافة عادية (Apache/Nginx)

#### على Apache (مع .htaccess):
```bash
# upload all files
# .htaccess already configured
# just ensure HTTPS is enabled
```

#### على Nginx:

**ملف التكوين:**
```nginx
server {
    listen 443 ssl http2;
    server_name ilmiyya-clinic.app;
    
    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/cnc;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    # Cache headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker - no cache
    location = /sw.js {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # HTML - no cache
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~ /\. {
        deny all;
    }
}
```

## 🔐 إعدادات الأمان

### HTTPS (إلزامي)
- استخدم دائماً HTTPS
- احصل على شهادة مجاني من Let's Encrypt
- عادة ما يتم التشغيل التلقائي من قبل خدمات الاستضافة

### HSTS Header
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CSP Header (اختياري ولكن موصى)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' www.googletagmanager.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com;
```

## 🔄 عملية التحديث

عند تحديث التطبيق:

```bash
# 1. تحديث الملفات
git add .
git commit -m "update: تحديث الإصدار"

# 2. تحديث رقم الإصدار
# - GitHub: أضف tag/release
# - manifest.json: اختياري
# - sw.js: غيّر رقم version (v8 -> v9)

# 3. نشر
firebase deploy
# أو
netlify deploy --prod
# أو
git push origin main  # GitHub Pages
```

## ✅ اختبار بعد النشر

### 1. اختبر الأساسيات
```bash
# تحقق من HTTP Headers
curl -I https://ilmiyya-clinic.app/

# تحقق من Service Worker
# افتح DevTools -> Application -> Service Worker
```

### 2. اختبر PWA
- [ ] يظهر "إضافة إلى الشاشة الرئيسية"
- [ ] السجل مثبت
- [ ] يعمل بدون إنترنت
- [ ] Push notifications تعمل

### 3. اختبر SEO
```bash
# اختبر Google Search Console
# اختبر robots.txt
# اختبر sitemap.xml
# اختبر og: tags في social media
```

### 4. اختبر الأداء
```bash
# Lighthouse Score
# Google PageSpeed Insights
# GTmetrix
```

## 🐛 استكشاف الأخطاء

### Service Worker لا يعمل
```javascript
// في المتصفح console
navigator.serviceWorker.controller // يجب أن يعيد callback
navigator.serviceWorker.getRegistrations() // لرؤية جميع registrations
```

### الكاش لم يتحدث
- امسح الـ cache: DevTools -> Application -> Clear Storage
- استخدم hard refresh: Ctrl+Shift+R
- افتح incognito tab

### الأيقونات لا تظهر
- تحقق من مسارات الملفات
- تجنب slash في البداية: `./my-new-icon-512.png` (لا `./`)

---

## 📞 الدعم والمساعدة

إذا واجهت مشاكل:
- تحقق من [Troubleshooting Guide](#troubleshooting)
- افتح issue على GitHub
- تواصل عبر: support@ilmiyya-clinic.app

---

**نشر سعيد! 🚀**
