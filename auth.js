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

/**
 * يبدأ هذا التابع عملية المصادقة عند بدء تشغيل التطبيق.
 * يتحقق من وجود مستخدم مسجل دخوله عبر Firebase أولاً،
 * ثم يعود للتحقق من الجلسة القديمة (معرف العيادة).
 */
function initAuth() {
  console.log('🚀 بدء تهيئة المصادقة...');

  firebase.auth().onAuthStateChanged(user => {
    const splash = document.getElementById('splashScreen');
    if (user) {
      // المستخدم مسجل دخوله عبر Firebase (بريد إلكتروني أو جوجل)
      console.log('🔥 مستخدم Firebase مسجل الدخول:', user.uid);
      // الدالة `syncWithOnlineDatabase` ستتولى عرض التطبيق
      syncWithOnlineDatabase(user.uid, null); // لا حاجة لكلمة مرور هنا
    } else {
      // لا يوجد مستخدم Firebase، تحقق من الجلسة القديمة
      console.log('🔥 لا يوجد مستخدم Firebase. التحقق من الجلسة القديمة...');
      const session = authSession.getSession();
      if (session && session.clinicId) {
        console.log('✅ جلسة قديمة موجودة:', session.clinicId);
        const userData = authSession.getData();
        clinicId = session.clinicId;
        if (userData) {
          dbData = userData;
          loadOfflineData();
          console.log('📦 تم تحميل البيانات المحلية');
        }
        if (navigator.onLine) {
          console.log('🔄 محاولة المزامنة...');
          syncWithOnlineDatabase(session.clinicId, session.password);
        } else if (userData) {
          console.log('🔌 وضع عدم الاتصال، عرض البيانات المحلية.');
          showApp();
        } else {
          // غير متصل بالإنترنت ولا توجد بيانات مخبأة
          if (splash) splash.style.display = 'none';
          document.getElementById('loginScreen').style.display = 'flex';
        }
      } else {
        // لا توجد أي جلسات على الإطلاق
        console.log('🔐 لا توجد جلسة، عرض شاشة تسجيل الدخول.');
        if (splash) splash.style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
      }
    }
  });
}

/**
 * التعامل مع تسجيل الدخول باستخدام "معرف العيادة"
 */
function handleLogin() {
  const id = document.getElementById('loginClinicId').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('btnLogin');
  const rememberMe = document.getElementById('rememberMe').checked;

  console.log('🔐 محاولة تسجيل دخول:', id);

  if (!id || !pass) {
    showError(errorEl, 'يرجى إدخال معرف العيادة وكلمة المرور.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
  errorEl.style.display = 'none';

  // التعامل مع تسجيل الدخول في وضع عدم الاتصال
  if (!navigator.onLine) {
    handleOfflineLogin(id, pass, errorEl, btn);
    return;
  }

  // التحقق من Firebase
  db.ref('clinics/' + id).once('value').then(snap => {
    const data = snap.val();
    if (data === null) {
      showError(errorEl, '❌ معرف العيادة غير موجود.');
      resetBtn(btn);
    } else if (data.password === pass) {
      console.log('✅ تم التحقق من كلمة المرور بنجاح');
      clinicId = id;
      dbData = {
        patients: data.patients || {},
        visits: data.visits || {}
      };
      if (rememberMe) {
        authSession.saveSession(id, pass);
      }
      authSession.saveData(dbData);
      loadOfflineData();
      showApp();
    } else {
      showError(errorEl, '❌ كلمة المرور غير صحيحة.');
      resetBtn(btn);
    }
  }).catch(err => {
    console.error('خطأ Firebase:', err);
    showError(errorEl, '❌ خطأ في الاتصال بالخادم.');
    resetBtn(btn);
  });
}

function resetBtn(btn) {
  btn.disabled = false;
  btn.innerHTML = 'دخول';
}

function handleOfflineLogin(id, pass, errorEl, btn) {
  const session = authSession.getSession();
  const userData = authSession.getData();

  // دقة أكثر في التحقق من وضع الاوفلاين
  if (userData && id && pass) {
    // إذا كان هناك بيانات محفوظة واسم المستخدم وكلمة المرور يطابقان الجلسة المحفوظة
    if (session && session.clinicId === id && session.password === pass) {
      console.log('✅ تسجيل دخول بدون نت (جلسة متطابقة)');
      clinicId = id;
      dbData = userData;
      loadOfflineData();
      showApp();
      return;
    }
  }

  showError(errorEl, '❌ لا يمكن الدخول: تأكد من الاتصال بالإنترنت أو صحة البيانات المحفوظة.');
  resetBtn(btn);
}

function signOut() {
  // تسجيل الخروج من Firebase Auth
  firebase.auth().signOut().catch(error => {
    console.error('خطأ في تسجيل الخروج من Firebase', error);
  });

  // حذف الجلسة القديمة
  authSession.logout();
  location.reload();
}

function handleLogout() {
  showConfirm('هل أنت متأكد من أنك تريد تسجيل الخروج؟', signOut);
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// --- دوال المصادقة باستخدام Firebase Auth ---

function handleEmailRegister() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginEmailPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!email || !password) {
    return showError(errorEl, 'يرجى إدخال البريد الإلكتروني وكلمة المرور.');
  }
  if (password.length < 6) {
    return showError(errorEl, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => initializeClinicForNewUser(userCredential.user.uid))
    .catch(error => {
      console.error('خطأ في التسجيل:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        showError(errorEl, '❌ هذا البريد الإلكتروني مسجل بالفعل.');
      } else {
        showError(errorEl, '❌ حدث خطأ أثناء التسجيل.');
      }
    });
}

function handleEmailLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginEmailPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!email || !password) {
    return showError(errorEl, 'يرجى إدخال البريد الإلكتروني وكلمة المرور.');
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('✅ تم تسجيل الدخول:', userCredential.user.uid);
      // سيتم التعامل مع عرض التطبيق بواسطة `onAuthStateChanged` -> `initAuth`
    })
    .catch(error => {
      console.error('خطأ في تسجيل الدخول:', error.code, error.message);
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
        showError(errorEl, '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else {
        showError(errorEl, '❌ حدث خطأ أثناء تسجيل الدخول.');
      }
    });
}

function handleGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      console.log('✅ تم تسجيل الدخول عبر جوجل:', user.uid);
      if (result.additionalUserInfo.isNewUser) {
        console.log('✅ مستخدم جوجل جديد، جاري إنشاء العيادة...');
        initializeClinicForNewUser(user.uid);
      } else {
        // سيتم التعامل مع المستخدم الحالي بواسطة `onAuthStateChanged`
        console.log('✅ مستخدم جوجل عائد.');
      }
    }).catch(error => {
      console.error('خطأ في تسجيل الدخول عبر جوجل:', error.code, error.message);
      showError(document.getElementById('loginError'), '❌ فشل تسجيل الدخول باستخدام جوجل.');
    });
}

/**
 * يقوم بإنشاء هيكل بيانات مبدئي لعيادة جديدة لمستخدم Firebase جديد
 * @param {string} userId - معرف المستخدم من Firebase Auth
 */
function initializeClinicForNewUser(userId) {
  const initialData = {
    owner: userId,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    patients: {},
    visits: {}
  };

  db.ref('clinics/' + userId).set(initialData)
    .then(() => {
      console.log('✅ عيادة جديدة منشأة للمستخدم:', userId);
      clinicId = userId;
      dbData = initialData;
      authSession.saveData(dbData); // حفظ البيانات الفارغة محليًا
      loadOfflineData();
      showApp();
      document.getElementById('loginScreen').style.display = 'none';
    })
    .catch(err => {
      console.error('خطأ في إنشاء العيادة:', err);
      showError(document.getElementById('loginError'), '❌ خطأ في إعداد العيادة الجديدة.');
    });
}