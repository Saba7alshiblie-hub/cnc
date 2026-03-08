// data.js - Data management functions
let clinicId = null;
let dbData = { patients: {}, visits: {} };
let editPatientId = null;
let currentProfileId = null;
let visitPatientLock = null;
let deleteCallback = null;

function normalizeClinicData(rawData) {
  const input = rawData || {};
  const patientsIn = input.patients || {};
  const visitsIn = input.visits || {};
  const patients = {};
  const visits = {};

  Object.keys(patientsIn).forEach(id => {
    const p = patientsIn[id] || {};
    patients[id] = {
      ...p,
      name: typeof p.name === 'string' ? p.name : '',
      phone: typeof p.phone === 'string' ? p.phone : '',
      diseases: Array.isArray(p.diseases) ? p.diseases : []
    };
  });

  Object.keys(visitsIn).forEach(id => {
    const v = visitsIn[id] || {};
    visits[id] = {
      ...v,
      patientId: typeof v.patientId === 'string' ? v.patientId : '',
      service: typeof v.service === 'string' ? v.service : '',
      date: typeof v.date === 'string' ? v.date : '',
      notes: typeof v.notes === 'string' ? v.notes : ''
    };
  });

  return { patients, visits };
}

function loadOfflineData() {
  updateUI();
  loadPatients();
  loadTodayVisits();
}

function updateConnectionBadge(isOnline) {
  const status = document.getElementById('connectionStatus');
  if (!status) return;
  status.innerHTML = isOnline
    ? '<i class="fas fa-wifi" style="color:#10b981;"></i> متصل'
    : '<i class="fas fa-wifi-slash" style="color:#ef4444;"></i> غير متصل';
}

function syncWithOnlineDatabase(id, pass, skipShow = false) {
  let appShown = skipShow;
  db.ref('clinics/' + id).on('value', snap => {
    const data = snap.val();
    // إذا كان pass = null فهذا مستخدم Firebase Auth (بريد/جوجل) ولا نتحقق من كلمة المرور
    const passwordOk = pass === null ? true : (data && data.password === pass);
    if (data && passwordOk) {
      clinicId = id;
      dbData = normalizeClinicData(data);
      authSession.saveData(dbData);
      loadOfflineData();
      if (!appShown) {
        appShown = true;
        showApp();
      }
      document.getElementById('syncDot').className = 'sync-dot ok';
      document.getElementById('syncStatusText').textContent = 'متصل';
      updateConnectionBadge(true);
    }
  }, err => {
    console.error('خطأ في المزامنة:', err);
    document.getElementById('syncDot').className = 'sync-dot err';
    document.getElementById('syncStatusText').textContent = 'خطأ';
    updateConnectionBadge(false);
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
