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

function syncWithOnlineDatabase(id, pass) {
  db.ref('clinics/' + id).on('value', snap => {
    const data = snap.val();
    if (data && data.password === pass) {
      dbData = {
        patients: data.patients || {},
        visits: data.visits || {}
      };
      authSession.saveData(dbData);
      loadOfflineData();
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