// auth.js - Authentication and session management
class AuthSession {
  constructor() {
    this.storageKey = 'clinic_session_v2';
    this.dataKey = 'clinic_data_v2';
    this.encryptionKey = 'clinic-secure-2024-' + window.location.hostname;
  }

  encrypt(text) {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return null;
    }
  }

  saveSession(clinicId, password) {
    const session = {
      clinicId: clinicId,
      password: password,
      savedAt: Date.now(),
      version: 2
    };
    const encrypted = this.encrypt(JSON.stringify(session));
    localStorage.setItem(this.storageKey, encrypted);
    sessionStorage.setItem(this.storageKey, encrypted);
    console.log('✅ تم حفظ الجلسة بشكل دائم');
    return session;
  }

  getSession() {
    const encrypted = localStorage.getItem(this.storageKey);
    if (!encrypted) return null;
    try {
      const decrypted = this.decrypt(encrypted);
      if (decrypted) {
        return JSON.parse(decrypted);
      }
    } catch (e) {
      console.error('خطأ في فك التشفير:', e);
    }
    return null;
  }

  hasValidSession() {
    return this.getSession() !== null;
  }

  saveData(clinicData) {
    const encrypted = this.encrypt(JSON.stringify(clinicData));
    localStorage.setItem(this.dataKey, encrypted);
  }

  getData() {
    const encrypted = localStorage.getItem(this.dataKey);
    if (!encrypted) return null;
    try {
      const decrypted = this.decrypt(encrypted);
      if (decrypted) {
        return JSON.parse(decrypted);
      }
    } catch (e) {
      console.error('خطأ في استرجاع البيانات:', e);
    }
    return null;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.dataKey);
    sessionStorage.removeItem(this.storageKey);
    console.log('👋 تم تسجيل الخروج');
  }
}

const authSession = new AuthSession();

function initAppWithSmartLogin() {
  console.log('🚀 بدء التطبيق...');
  if (authSession.hasValidSession()) {
    console.log('✅ جلسة محفوظة موجودة - الفتح المباشر');
    const session = authSession.getSession();
    const userData = authSession.getData();
    clinicId = session.clinicId;
    if (userData) {
      dbData = userData;
      loadOfflineData();
      console.log('📦 تم تحميل البيانات المحلية');
    }
    if (navigator.onLine) {
      console.log('🔄 محاولة المزامنة مع Firebase...');
      syncWithOnlineDatabase(session.clinicId, session.password);
    }
    showApp();
  } else {
    console.log('🔐 لا توجد جلسة محفوظة - اعرض شاشة التسجيل');
    document.getElementById('loginScreen').style.display = 'flex';
  }
}

function handleLogin() {
  const id = document.getElementById('loginClinicId').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('btnLogin');

  console.log('🔐 محاولة تسجيل دخول:', id);

  if (!id || !pass) {
    showError(errorEl, 'يرجى إدخال المعرف وكلمة المرور');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
  errorEl.style.display = 'none';

  if (!navigator.onLine) {
    handleOfflineLogin(id, pass, errorEl, btn);
    return;
  }

  db.ref('clinics/' + id).once('value').then(snap => {
    const data = snap.val();
    if (data === null) {
      createNewClinic(id, pass, errorEl, btn);
    } else if (data.password === pass) {
      clinicId = id;
      dbData = {
        patients: data.patients || {},
        visits: data.visits || {}
      };
      authSession.saveSession(id, pass);
      authSession.saveData(dbData);
      loadOfflineData();
      showApp();
      document.getElementById('loginScreen').style.display = 'none';
    } else {
      showError(errorEl, '❌ كلمة المرور غير صحيحة');
      btn.disabled = false;
      btn.innerHTML = 'دخول';
    }
  }).catch(err => {
    console.error('خطأ Firebase:', err);
    showError(errorEl, '❌ خطأ في الاتصال. جرب لاحقاً.');
    btn.disabled = false;
    btn.innerHTML = 'دخول';
  });
}

function handleOfflineLogin(id, pass, errorEl, btn) {
  const userData = authSession.getData();
  if (userData && userData.clinicId === id && userData.password === pass) {
    console.log('✅ تسجيل دخول بدون نت');
    clinicId = id;
    dbData = userData;
    authSession.saveSession(id, pass);
    loadOfflineData();
    showApp();
    document.getElementById('loginScreen').style.display = 'none';
  } else {
    showError(errorEl, '❌ بدون إنترنت - لا توجد بيانات محفوظة');
    btn.disabled = false;
    btn.innerHTML = 'دخول';
  }
}

function createNewClinic(id, pass, errorEl, btn) {
  const initial = {
    clinicId: id,
    password: pass,
    createdAt: Date.now(),
    patients: {
      p1: { name: "محمد حمزة", phone: "07733341855", diseases: [], meds: "", history: "", notes: "" },
      p2: { name: "علي جابر", phone: "07865161719", diseases: [], meds: "", history: "", notes: "" },
      p3: { name: "كاظم محمد كامل", phone: "07818429336", diseases: ["ضغط دم"], meds: "لا يوجد", history: "غير رياضي", notes: "" }
    },
    visits: { v1: { patientId: "p3", service: "حجامة - النوع الأول", date: today(), notes: "ألم أسفل الظهر" } }
  };

  db.ref('clinics/' + id).set(initial).then(() => {
    console.log('✅ عيادة جديدة منشأة');
    clinicId = id;
    dbData = initial;
    authSession.saveSession(id, pass);
    authSession.saveData(initial);
    loadOfflineData();
    showApp();
    document.getElementById('loginScreen').style.display = 'none';
  }).catch(err => {
    console.error('خطأ في إنشاء العيادة:', err);
    showError(errorEl, '❌ خطأ في إنشاء العيادة');
    btn.disabled = false;
    btn.innerHTML = 'دخول';
  });
}

function signOut() {
  authSession.logout();
  location.reload();
}

function handleLogout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    signOut();
  }
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}