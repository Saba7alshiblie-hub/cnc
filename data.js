// data.js - Data management functions
let clinicId = null;
let dbData = { patients: {}, visits: {} };
let editPatientId = null;
let currentProfileId = null;
let visitPatientLock = null;
let deleteCallback = null;

function loadOfflineData() {
  updateUI();
  loadPatients();
  loadTodayVisits();
}

function syncWithOnlineDatabase(id, pass, skipShow = false) {
  let appShown = skipShow;
  db.ref('clinics/' + id).on('value', snap => {
    const data = snap.val();
    // إذا كان pass = null فهذا مستخدم Firebase Auth (بريد/جوجل) ولا نتحقق من كلمة المرور
    const passwordOk = pass === null ? true : (data && data.password === pass);
    if (data && passwordOk) {
      clinicId = id;
      dbData = {
        patients: data.patients || {},
        visits: data.visits || {}
      };
      authSession.saveData(dbData);
      loadOfflineData();
      if (!appShown) {
        appShown = true;
        showApp();
      }
      document.getElementById('syncDot').className = 'sync-dot ok';
      document.getElementById('syncStatusText').textContent = 'متصل';
    }
  }, err => {
    console.error('خطأ في المزامنة:', err);
    document.getElementById('syncDot').className = 'sync-dot err';
    document.getElementById('syncStatusText').textContent = 'خطأ';
  });
}

function saveToFirebase() {
  if (!clinicId || !navigator.onLine) return;
  db.ref('clinics/' + clinicId).update(dbData).then(() => {
    console.log('✅ تم الحفظ في Firebase');
    document.getElementById('syncDot').className = 'sync-dot ok';
  }).catch(err => {
    console.error('خطأ في الحفظ:', err);
    document.getElementById('syncDot').className = 'sync-dot err';
  });
}