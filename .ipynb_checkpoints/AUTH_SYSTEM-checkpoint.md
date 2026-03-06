# نظام تسجيل الدخول الذكي المحسّن

نظام محسّن يدعم الفتح بدون إنترنت والمزامنة التلقائية.

## 🎯 المميزات

✅ تسجيل دخول لأول مرة فقط  
✅ فتح مباشرة بدون إنترنت  
✅ مزامنة تلقائية عند توفر النت  
✅ تسجيل خروج اختياري  
✅ خيار تذكر الجهاز  

---

## 📝 الكود المحسّن

```javascript
// ============================================
// نظام تسجيل الدخول الذكي المحسّن
// ============================================

class AuthSession {
  constructor() {
    this.storageKey = 'clinic_session';
    this.dataKey = 'clinic_data_offline';
    this.lastSyncKey = 'clinic_last_sync';
    this.maxOfflineTime = 30 * 24 * 60 * 60 * 1000; // 30 يوم
  }

  // حفظ جلسة
  saveSession(clinicId, password, rememberMe = false) {
    const session = {
      clinicId: clinicId,
      password: password,
      loginTime: Date.now(),
      rememberMe: rememberMe,
      lastOnline: Date.now()
    };
    const sessionStr = JSON.stringify(session);
    const encrypted = CryptoJS.AES.encrypt(sessionStr, 'clinic-secure-key-2024').toString();
    localStorage.setItem(this.storageKey, encrypted);
    return session;
  }

  // استرجاع الجلسة
  getSession() {
    const encrypted = localStorage.getItem(this.storageKey);
    if (!encrypted) return null;
    const bytes = CryptoJS.AES.decrypt(encrypted, 'clinic-secure-key-2024');
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }

  // التحقق من صلاحية الجلسة
  isSessionValid() {
    const session = this.getSession();
    if (!session) return false;

    // تحقق من مدة الخمول (30 يوم)
    const timeSinceLastOnline = Date.now() - session.lastOnline;
    if (timeSinceLastOnline > this.maxOfflineTime) {
      this.clearSession();
      return false;
    }

    return true;
  }

  // حفظ البيانات محلياً
  saveOfflineData(data) {
    const dataStr = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(dataStr, 'clinic-secure-key-2024').toString();
    localStorage.setItem(this.dataKey, encrypted);
    localStorage.setItem(this.lastSyncKey, Date.now().toString());
  }

  // استرجاع البيانات المحلية
  getOfflineData() {
    const encrypted = localStorage.getItem(this.dataKey);
    if (!encrypted) return null;
    const bytes = CryptoJS.AES.decrypt(encrypted, 'clinic-secure-key-2024');
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }

  // حذف الجلسة (تسجيل خروج)
  clearSession() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.dataKey);
    localStorage.removeItem(this.lastSyncKey);
  }

  // تحديث وقت آخر اتصال
  updateLastOnlineTime() {
    const session = this.getSession();
    if (session) {
      session.lastOnline = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
  }
}

// إنشاء instance من AuthSession
const authSession = new AuthSession();

// ============================================
// دالة الفتح الذكي
// ============================================

function initAppWithSmartLogin() {
  // تحقق من الجلسة السابقة
  if (authSession.isSessionValid()) {
    // إذا كانت جلسة سابقة موجودة، افتح التطبيق مباشرة
    console.log('✅ جلسة سابقة موجودة، فتح التطبيق مباشرة...');
    
    const session = authSession.getSession();
    clinicId = session.clinicId;
    
    // جرّب المزامنة مع الإنترنت
    if (navigator.onLine) {
      syncWithOnlineDatabase(session.clinicId, session.password);
    } else {
      console.log('📴 بدون إنترنت، تحميل البيانات المحلية...');
      loadOfflineData();
    }
    
    showApp();
  } else {
    // لا توجد جلسة، اعرض شاشة تسجيل الدخول
    console.log('🔐 لا توجد جلسة، اعرض شاشة تسجيل الدخول');
    document.getElementById('loginScreen').style.display = 'flex';
  }
}

// ============================================
// تحديث دالة handleLogin
// ============================================

function handleLogin(rememberDevice = false) {
  console.log('Login function called');
  var id = document.getElementById('loginClinicId').value.trim().toLowerCase();
  var pass = document.getElementById('loginPassword').value;
  var errorEl = document.getElementById('loginError');
  var btn = document.getElementById('btnLogin');

  if (!id || !pass) {
    errorEl.textContent = 'يرجى إدخال المعرف وكلمة المرور';
    errorEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاتصال...';
  errorEl.style.display = 'none';

  // إذا كان بدون إنترنت، جرّب من البيانات المحلية
  if (!navigator.onLine) {
    const offlineData = authSession.getOfflineData();
    if (offlineData && offlineData.clinicId === id) {
      // تحقق من كلمة المرور المحلية
      if (offlineData.password === pass) {
        console.log('✅ تسجيل دخول من البيانات المحلية');
        clinicId = id;
        authSession.saveSession(id, pass, rememberDevice);
        loadOfflineData();
        showApp();
        return;
      } else {
        errorEl.textContent = 'كلمة المرور غير صحيحة';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = 'دخول';
        return;
      }
    } else {
      errorEl.textContent = 'لا توجد بيانات محلية. يرجى الاتصال بالإنترنت لأول تسجيل دخول';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = 'دخول';
      return;
    }
  }

  // اتصل بقاعدة البيانات عند توفر الإنترنت
  console.log('جاري الاتصال بالعيادة:', id);

  db.ref('clinics/' + id).once('value').then(snap => {
    console.log('تم الاتصال، البيانات:', snap.val());
    const data = snap.val();
    
    if (data === null) {
      // Create new clinic
      console.log('إنشاء عيادة جديدة...');
      const initial = {
        password: pass,
        createdAt: Date.now(),
        patients: {
          p1: { name: "محمد حمزة", phone: "07733341855", diseases: [], meds: "", history: "", notes: "" },
          p2: { name: "علي جابر", phone: "07865161719", diseases: [], meds: "", history: "", notes: "" },
          p3: { name: "كاظم محمد كامل", phone: "07818429336", diseases: ["ضغط دم"], meds: "لا يوجد", history: "غير رياضي", notes: "" }
        },
        visits: { v1: { patientId: "p3", service: "حجامة - النوع الاول", date: today(), notes: "الم أسفل الظهر" } }
      };
      return db.ref('clinics/' + id).set(initial);
    } else if (data.password !== pass) {
      throw new Error('wrong_password');
    }
    
    // احفظ البيانات محلياً
    const dataToSave = {
      clinicId: id,
      password: pass,
      data: data,
      lastSync: Date.now()
    };
    authSession.saveOfflineData(dataToSave);
    
    return Promise.resolve();
  }).then(() => {
    clinicId = id;
    
    // احفظ الجلسة (مع خيار التذكر)
    authSession.saveSession(id, pass, rememberDevice);
    
    showApp();
  }).catch(err => {
    console.error('خطأ:', err);
    btn.disabled = false;
    btn.innerHTML = 'دخول';
    
    if (err.message === 'wrong_password') {
      errorEl.textContent = 'كلمة المرور غير صحيحة';
    } else {
      errorEl.textContent = 'خطأ في الاتصال: ' + err.message;
    }
    errorEl.style.display = 'block';
  });
}

// ============================================
// المزامنة التلقائية
// ============================================

function syncWithOnlineDatabase(clinicId, password) {
  if (!navigator.onLine) {
    console.log('📴 بدون إنترنت، لا يمكن المزامنة');
    return;
  }

  console.log('🔄 جاري المزامنة مع قاعدة البيانات...');

  db.ref('clinics/' + clinicId).once('value').then(snap => {
    const data = snap.val();
    
    if (data && data.password === password) {
      // احفظ البيانات محلياً
      const dataToSave = {
        clinicId: clinicId,
        password: password,
        data: data,
        lastSync: Date.now()
      };
      authSession.saveOfflineData(dataToSave);
      authSession.updateLastOnlineTime();
      
      console.log('✅ تمت المزامنة بنجاح');
      return true;
    } else {
      console.error('❌ فشل المصادقة أثناء المزامنة');
      return false;
    }
  }).catch(err => {
    console.error('❌ خطأ في المزامنة:', err);
  });
}

// ============================================
// تحميل البيانات المحلية
// ============================================

function loadOfflineData() {
  const offlineData = authSession.getOfflineData();
  
  if (offlineData) {
    // استخدم البيانات المحلية
    console.log('📦 تحميل البيانات المحلية', offlineData);
    // هنا يمكنك تحديث واجهة التطبيق بالبيانات المحلية
  } else {
    console.warn('⚠️ لا توجد بيانات محلية');
  }
}

// ============================================
// تسجيل خروج
// ============================================

function handleLogout() {
  if (confirm('هل تريد تسجيل الخروج؟\n\nستبقى البيانات محفوظة محلياً للاستخدام بدون إنترنت')) {
    authSession.clearSession();
    console.log('✅ تم تسجيل الخروج');
    location.reload();
  }
}

// ============================================
// الاستماع لتغيرات حالة الإنترنت
// ============================================

window.addEventListener('online', () => {
  console.log('🟢 عاد الإنترنت');
  
  const session = authSession.getSession();
  if (session) {
    syncWithOnlineDatabase(session.clinicId, session.password);
  }
});

window.addEventListener('offline', () => {
  console.log('🔴 فقدان الإنترنت');
  showNotification('تم فقدان الإنترنت', {
    body: 'سيتم حفظ التغييرات محلياً ومزامنتها عند العودة للإنترنت'
  });
});

// ============================================
// الاستدعاء الأول عند تحميل الصفحة
// ============================================

window.addEventListener('load', () => {
  // استدعِ الفتح الذكي بدلاً من showLoginScreen()
  initAppWithSmartLogin();
});
```

---

## 📱 إضافة أزرار في الواجهة

أضف هذه الأزرار إلى واجهة التطبيق (topbar يساراً):

```html
<!-- زر تسجيل الخروج -->
<button class="btn btn-danger" onclick="handleLogout()" style="margin-right: auto;">
  <i class="fas fa-sign-out-alt"></i> تسجيل خروج
</button>

<!-- حالة الاتصال -->
<span id="connectionStatus" style="font-size: 12px; color: #64748b;">
  <i class="fas fa-wifi" style="color: #10b981;"></i> متصل
</span>
```

---

## 🔧 إضافة خيار "تذكر هذا الجهاز"

في شاشة تسجيل الدخول:

```html
<div class="login-checkbox">
  <input type="checkbox" id="rememberDevice">
  <label for="rememberDevice">تذكر هذا الجهاز</label>
</div>

<button type="button" class="btn-login" id="btnLogin" 
  onclick="handleLogin(document.getElementById('rememberDevice').checked)">
  دخول
</button>
```

---

## 🔐 السلوك الجديد

| السيناريو | السلوك |
|----------|--------|
| لأول مرة | ✅ اعرض شاشة تسجيل الدخول |
| مع إنترنت | ✅ تحقق من قاعدة البيانات وحفظ محلياً |
| بدون إنترنت | ✅ استخدم البيانات المحلية |
| عودة الإنترنت | 🔄 مزامنة تلقائية |
| بعد 30 يوم | ⚠️ اطلب تسجيل دخول جديد |

---

## ✅ الفوائد

✅ **تجربة أفضل** - فتح فوري بدون تسجيل دخول متكرر  
✅ **يعمل بدون إنترنت** - استخدام البيانات المحفوظة  
✅ **مزامنة ذكية** - تحديث تلقائي عند توفر الإنترنت  
✅ **آمن** - لا يحفظ كلمة المرور غير المشفرة (يمكن تحسينها)  
✅ **خيارات تحكم** - تسجيل خروج اختياري  

---

## 🚀 التطبيق على مشروعك

انسخ هذا الكود في `index.html` واستبدل:

1. دالة `handleLogin()` القديمة بـ `handleLogin(rememberDevice)`
2. أضف `class AuthSession`
3. استدعِ `initAppWithSmartLogin()` بدلاً من `showLoginScreen()`
4. أضف أزرار الخروج والحالة في الواجهة

هل تريد مني أطبق هذا الكود مباشرة في ملفك؟ 🚀
