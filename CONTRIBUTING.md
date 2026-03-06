# مساهمات - Contribution Guidelines

شكراً لاهتمامك بالمساهمة في مشروع العيادة العلمية! 🎉

## كيفية المساهمة

### 1. وقبل البدء
- اقرأ [README.md](README.md) لفهم المشروع
- اقرأ [CHANGELOG.md](CHANGELOG.md) لرؤية آخر التحديثات
- تحقق من [Issues](https://github.com/Saba7alshiblie-hub/cnc/issues) الموجودة

### 2. إعداد بيئة التطوير

```bash
# Clone المودع
git clone https://github.com/Saba7alshiblie-hub/cnc.git
cd cnc

# استخدم خادم محلي
python -m http.server 8000
# أو
npx http-server
```

### 3. عملية المساهمة

1. **Fork** المودع
2. **Create** برانش جديد:
   ```bash
   git checkout -b feature/اسم-الميزة
   ```
3. **Commit** التغييرات:
   ```bash
   git commit -m "إضافة: وصف واضح للتغيير"
   ```
4. **Push** إلى الفرع:
   ```bash
   git push origin feature/اسم-الميزة
   ```
5. **Open** Pull Request

## معايير الكود

### HTML
- استخدم **Semantic HTML** (header, main, nav, section, article)
- أضف **ARIA labels** للعناصر التفاعلية
- تأكد من **HTML validation**

### CSS
- استخدم **CSS Variables** للألوان والمتغيرات
- اتبع **BEM naming** للـ classes
- أضف **media queries** للاستجابة

### JavaScript
- استخدم **ES6+** (const/let بدلاً من var)
- أضف **comments** شارحة
- تجنب **global variables**
- استخدم **async/await** بدلاً من callbacks

### الأداء
- قلل عدد **HTTP requests**
- استخدم **CSS minification**
- أضف **lazy loading** للصور
- تحقق من **Lighthouse scores**

## معايير Commit

استخدم الصيغة التالية:
```
<type>: <subject>

<body>

<footer>
```

### أنواع Commits:
- `feat:` ميزة جديدة
- `fix:` إصلاح خلل
- `docs:` تحديثات التوثيق
- `style:` تنسيق الكود
- `refactor:` إعادة هيكلة
- `perf:` تحسينات الأداء
- `test:` إضافة اختبارات
- `chore:` مهام صيانة

### أمثلة:
```
feat: إضافة دعم Dark Mode

- استخدام CSS variables للألوان
- حفظ التفضيل محلياً
```

```
fix: إصلاح خطأ في Service Worker

- إضافة error handling للـ fetch
- تحسين استراتيجية Caching
```

## اختبار التغييرات

### قبل Commit:
- [ ] جرب على جهاز حقيقي
- [ ] جرب على أحجام شاشات مختلفة
- [ ] تحقق من **DevTools Lighthouse**
- [ ] تحقق من **Accessibility (A11y)**
- [ ] جرب الـ **Offline Mode** (بدون اتصال)

### أدوات الاختبار المفيدة:
- **Chrome DevTools** - للـ Performance والـ Accessibility
- **Lighthouse** `Ctrl+Shift+I` في Chrome
- **WAVE Extension** - لفحص الـ Accessibility
- **GTmetrix** - لتحليل الأداء
- **Responsively App** - لاختبار التجاوب

## التوثيق

يجب توثيق:
- ميزات جديدة في [README.md](README.md)
- تغييرات في [CHANGELOG.md](CHANGELOG.md)
- الكود نفسه مع comments واضحة

## مسائل الأمان

🔒 **لا تشارك** معلومات حساسة:
- Firebase keys أو credentials
- البيانات الشخصية للمرضى
- كلمات مرور

إذا وجدت مشكلة أمنية:
- لا تفتح public issue
- أرسل بريد إلى: [support@ilmiyya-clinic.app](mailto:support@ilmiyya-clinic.app)

## الترخيص

بمساهمتك، توافق على ترخيص الكود تحت [MIT License](LICENSE)

## أسئلة؟

- 💬 [GitHub Discussions](https://github.com/Saba7alshiblie-hub/cnc/discussions)
- 📧 [support@ilmiyya-clinic.app](mailto:support@ilmiyya-clinic.app)

---

**شكراً لمساهمتك! 🙏**
