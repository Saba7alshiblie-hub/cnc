// ui.js - UI management functions
function initLogo() {
  const logoUrl = 'logo.png';
  const html = '<img src="' + logoUrl + '" alt="العيادة العلمية" loading="lazy">';
  document.getElementById('loginLogo').innerHTML = html;
  document.getElementById('sidebarLogo').innerHTML = html;
  document.getElementById('mobileLogo').innerHTML = html;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('open');
}

function switchLoginMethod(method) {
  const isClinic = method === 'clinic';
  document.getElementById('clinicIdLogin').style.display = isClinic ? 'block' : 'none';
  document.getElementById('emailLogin').style.display = isClinic ? 'none' : 'block';

  const tabs = document.querySelectorAll('.login-tab');
  tabs[0].classList.toggle('active', isClinic);
  tabs[1].classList.toggle('active', !isClinic);
}

function showApp() {
  document.getElementById('appShell').style.display = 'flex';
  document.getElementById('loginScreen').style.display = 'none';
  bindUIInteractions();
  handlePostLoginActions();
  initDarkMode();
  requestNotificationPermission();
  showPage('dash');
  updateUI();
}

function updateUI() {
  const patientCount = dbData.patients ? Object.keys(dbData.patients).length : 0;
  document.getElementById('patientsBadge').textContent = patientCount;
  document.getElementById('userName').textContent = clinicId || 'العيادة';
}

function loadDashboard() {
  const patients = objToArray(dbData.patients);
  const visits = objToArray(dbData.visits);
  const todayVisits = visits.filter(v => v.date === today());

  document.getElementById('statTotal').textContent = patients.length;
  document.getElementById('statToday').textContent = todayVisits.length;
  document.getElementById('statVisits').textContent = visits.length;

  const reminders = patients.filter(p => {
    const lastVisit = visits.filter(v => v.patientId === p.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!lastVisit) return false;
    const daysSince = (new Date() - new Date(lastVisit.date)) / (1000 * 60 * 60 * 24);
    return daysSince > 30; // Remind after 30 days
  });
  document.getElementById('statReminders').textContent = reminders.length;

  loadRecentVisits();
}

function loadRecentVisits() {
  const visits = objToArray(dbData.visits).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const container = document.getElementById('recentVisitsList');
  container.innerHTML = '';

  if (visits.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fas fa-calendar"></i></div><p>لا توجد زيارات</p></div>';
    return;
  }

  visits.forEach(visit => {
    const patient = dbData.patients[visit.patientId];
    if (!patient) return;
    const card = document.createElement('div');
    card.className = 'today-card';
    card.innerHTML = `
      <div class="tc-avatar" style="background: ${getColor(patient.name)}">${getLetter(patient.name)}</div>
      <div>
        <div class="tc-name">${patient.name}</div>
        <div style="font-size:14px;color:var(--gray-500);margin-top:4px;">${visit.service} - ${fmtDate(visit.date)}</div>
      </div>
    `;
    card.onclick = () => showPatientProfile(visit.patientId);
    container.appendChild(card);
  });
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

/**
 * يعرض نافذة تأكيد منبثقة مخصصة.
 * @param {string} message - الرسالة التي ستُعرض للمستخدم.
 * @param {function} onConfirm - الدالة التي سيتم استدعاؤها عند التأكيد.
 * @param {string} [title='تأكيد الإجراء'] - عنوان النافذة.
 */
function showConfirm(message, onConfirm, title = 'تأكيد الإجراء') {
  const modal = document.getElementById('modalConfirm');
  document.getElementById('modalConfirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = message;
  const confirmBtn = document.getElementById('confirmBtn');

  // استنساخ واستبدال الزر لإزالة أي مستمعي أحداث قدامى
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.onclick = () => { closeModal('modalConfirm'); onConfirm(); };
  modal.classList.add('open');
}

function openNewPatientModal() {
  editPatientId = null;
  document.getElementById('patientModalTitle').textContent = 'مريض جديد';
  document.querySelectorAll('#modalAddPatient input, #modalAddPatient select, #modalAddPatient textarea').forEach(el => el.value = '');
  document.querySelectorAll('.err-msg').forEach(el => el.style.display = 'none');
  const ageDisplay = document.getElementById('ageDisplay');
  if (ageDisplay) ageDisplay.style.display = 'none';
  document.getElementById('modalAddPatient').classList.add('open');
}

function savePatient() {
  const name = document.getElementById('inp_name').value.trim();
  const phone = document.getElementById('inp_phone').value.trim();
  const address = document.getElementById('inp_address').value.trim();
  const birthYear = parseInt(document.getElementById('inp_age').value, 10);
  const age = birthYear ? (new Date().getFullYear() - birthYear) : '';
  const diseases = Array.from(document.querySelectorAll('#chronicCbs .cb-item.sel')).map(el => el.getAttribute('data-value'));
  const meds = document.getElementById('inp_meds').value.trim();
  const history = document.getElementById('inp_history').value.trim();
  const notes = document.getElementById('inp_notes').value.trim();

  if (!name) {
    document.getElementById('err_name').style.display = 'block';
    return;
  }

  const patient = {
    name, phone, address, age, birthYear: birthYear || '',
    diseases, meds, history, notes,
    createdAt: Date.now()
  };

  if (editPatientId) {
    dbData.patients[editPatientId] = { ...dbData.patients[editPatientId], ...patient };
  } else {
    const id = uid();
    dbData.patients[id] = patient;
  }

  saveToFirebase();
  closeModal('modalAddPatient');
  loadPatients();
  loadDashboard();
  showToast(editPatientId ? 'تم تحديث المريض' : 'تم إضافة المريض');
}

function loadPatients() {
  const search = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const patients = objToArray(dbData.patients).filter(patient => {
    const patientName = (patient.name || '').toLowerCase();
    const patientPhone = (patient.phone || '').toLowerCase();
    return !search || patientName.includes(search) || patientPhone.includes(search);
  });
  const visitsArray = objToArray(dbData.visits);
  const tbody = document.getElementById('patientsTableBody');
  tbody.innerHTML = '';

  if (patients.length === 0) {
    document.getElementById('patientsEmpty').style.display = 'block';
    return;
  }

  document.getElementById('patientsEmpty').style.display = 'none';

  patients.forEach(patient => {
    const diseases = Array.isArray(patient.diseases) ? patient.diseases : [];
    const patientVisits = visitsArray.filter(v => v.patientId === patient.id);
    const lastVisit = patientVisits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="patient-name-cell">
          <div class="avatar" style="background: ${getColor(patient.name)}">${getLetter(patient.name)}</div>
          <div>
            <div class="p-name">${patient.name}</div>
            <div class="last-visit">${patient.phone || '—'}</div>
          </div>
        </div>
      </td>
      <td>${patient.phone || '—'}</td>
      <td>${patient.age || '—'}</td>
      <td>${diseases.join(', ') || '—'}</td>
      <td><span class="visit-count">${patientVisits.length}</span></td>
      <td>${fmtDate(lastVisit?.date)}</td>
      <td>
        <div class="btn-row-actions">
          <button class="btn-sm primary" onclick="showPatientProfile('${patient.id}')" aria-label="عرض الملف"><i class="fas fa-eye"></i></button>
          <button class="btn-sm" onclick="editPatient('${patient.id}')" aria-label="تعديل"><i class="fas fa-edit"></i></button>
          <button class="btn-sm danger" onclick="deletePatient('${patient.id}')" aria-label="حذف"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('patientCount').textContent = patients.length;
}

function showPatientProfile(patientId) {
  const patient = dbData.patients[patientId];
  if (!patient) return;

  const visits = objToArray(dbData.visits).filter(v => v.patientId === patientId).sort((a, b) => new Date(b.date) - new Date(a.date));

  const content = `
    <div class="profile-header">
      <div class="profile-avatar" style="background: ${getColor(patient.name)}">${getLetter(patient.name)}</div>
      <div class="profile-info">
        <h2>${patient.name}</h2>
        <p>${patient.phone || 'لا يوجد رقم هاتف'}</p>
        <div class="profile-tags">
          ${(Array.isArray(patient.diseases) ? patient.diseases : []).map(d => `<span class="ptag">${d}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="profile-grid">
      <div class="info-card">
        <div class="info-card-title">المعلومات الشخصية</div>
        <div class="info-row"><div class="ir-label">الاسم</div><div class="ir-value">${patient.name}</div></div>
        <div class="info-row"><div class="ir-label">الهاتف</div><div class="ir-value">${patient.phone || '—'}</div></div>
        <div class="info-row"><div class="ir-label">العنوان</div><div class="ir-value">${patient.address || '—'}</div></div>
        <div class="info-row"><div class="ir-label">العمر</div><div class="ir-value">${patient.age || '—'}</div></div>
        <div class="info-row"><div class="ir-label">الأمراض المزمنة</div><div class="ir-value">${(Array.isArray(patient.diseases) ? patient.diseases : []).join(', ') || 'لا توجد'}</div></div>
        <div class="info-row"><div class="ir-label">الأدوية</div><div class="ir-value">${patient.meds || 'لا توجد'}</div></div>
        <div class="info-row"><div class="ir-label">التاريخ الشخصي</div><div class="ir-value">${patient.history || 'لا يوجد'}</div></div>
        <div class="info-row"><div class="ir-label">ملاحظات</div><div class="ir-value">${patient.notes || 'لا توجد'}</div></div>
      </div>
      <div class="info-card">
        <div class="info-card-title">الزيارات (${visits.length})</div>
        ${visits.map(v => `
          <div class="visit-card ${getServiceType(v.service)}">
            <div class="visit-head">
              <div class="visit-service ${getServiceType(v.service)}">${v.service}</div>
              <div class="visit-date">${fmtDate(v.date)}</div>
            </div>
            <div class="visit-details">${v.notes || 'لا توجد ملاحظات'}</div>
          </div>
        `).join('')}
        ${visits.length === 0 ? '<p style="text-align:center;color:var(--gray-500);padding:20px;">لا توجد زيارات</p>' : ''}
      </div>
    </div>
  `;

  document.getElementById('profileContent').innerHTML = content;
  currentProfileId = patientId;
  showPage('profile');
}

function editPatient(patientId) {
  const patient = dbData.patients[patientId];
  if (!patient) return;

  editPatientId = patientId;
  document.getElementById('patientModalTitle').textContent = 'تعديل المريض';
  document.getElementById('inp_name').value = patient.name || '';
  document.getElementById('inp_phone').value = patient.phone || '';
  document.getElementById('inp_address').value = patient.address || '';
  document.getElementById('inp_age').value = patient.birthYear || '';
  calculateAge();
  document.getElementById('inp_meds').value = patient.meds || '';
  document.getElementById('inp_history').value = patient.history || '';
  document.getElementById('inp_notes').value = patient.notes || '';

  document.querySelectorAll('#chronicCbs .cb-item').forEach(el => {
    el.classList.toggle('sel', (Array.isArray(patient.diseases) ? patient.diseases : []).includes(el.getAttribute('data-value')));
    el.querySelector('i').style.display = el.classList.contains('sel') ? 'block' : 'none';
  });

  document.getElementById('modalAddPatient').classList.add('open');
}

function deletePatient(patientId) {
  showConfirm('هل أنت متأكد أنك تريد حذف هذا المريض؟', () => {
    // حذف المريض من البيانات المحلية
    delete dbData.patients[patientId];

    // حفظ التغييرات في قاعدة البيانات
    saveToFirebase();
    loadPatients();
    loadDashboard();
    showToast('تم حذف المريض بنجاح', 'success');
    // إذا كان ملف المريض المحذوف معروضًا، ارجع إلى صفحة المرضى
    if (document.getElementById('pageProfile').classList.contains('active') && currentProfileId === patientId) {
      showPage('patients');
    }
  }, 'تأكيد الحذف');
}

function exportPatients() {
  const patients = objToArray(dbData.patients);
  const csv = 'Name,Phone,Age,Diseases,Medications,History,Notes\n' +
    patients.map(p => `"${p.name}","${p.phone}","${p.age}","${(Array.isArray(p.diseases) ? p.diseases : []).join('; ')}","${p.meds}","${p.history}","${p.notes}"`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'patients.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('تم تصدير البيانات');
}

function updateBottomNav(page) {
  const pages = ['dash', 'patients', 'today'];
  const index = pages.indexOf(page);
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach((item, i) => item.classList.toggle('active', i === index));
}

function showPage(page) {
  const pageMap = {
    dash: 'pageDash',
    patients: 'pagePatients',
    profile: 'pageProfile',
    today: 'pageToday'
  };
  const titleMap = {
    dash: 'لوحة التحكم',
    patients: 'المرضى',
    profile: 'ملف المريض',
    today: 'زيارات اليوم'
  };

  const pageId = pageMap[page];
  if (!pageId) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const activePage = document.getElementById(pageId);
  if (activePage) activePage.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + page);
  if (activeNav) activeNav.classList.add('active');

  const topbarTitle = document.getElementById('topbarTitle');
  if (topbarTitle) topbarTitle.textContent = titleMap[page] || '';

  const btnAddPatient = document.getElementById('btnAddPatient');
  const btnAddVisit = document.getElementById('btnAddVisit');
  if (btnAddPatient) btnAddPatient.style.display = page === 'patients' ? 'inline-flex' : 'none';
  if (btnAddVisit) btnAddVisit.style.display = page === 'profile' ? 'inline-flex' : 'none';

  updateBottomNav(page);

  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');

  if (page === 'dash') loadDashboard();
  if (page === 'patients') loadPatients();
  if (page === 'today') loadTodayVisits();
}

function calculateAge() {
  const input = document.getElementById('inp_age');
  const ageDisplay = document.getElementById('ageDisplay');
  if (!input || !ageDisplay) return;

  const birthYear = parseInt(input.value, 10);
  if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
    ageDisplay.style.display = 'none';
    return;
  }

  ageDisplay.textContent = 'العمر: ' + (new Date().getFullYear() - birthYear) + ' سنة';
  ageDisplay.style.display = 'block';
}

let uiBound = false;
function bindUIInteractions() {
  if (uiBound) return;
  uiBound = true;

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', loadPatients);
  }

  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  document.querySelectorAll('#chronicCbs .cb-item').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('sel');
      const icon = el.querySelector('i');
      if (icon) icon.style.display = el.classList.contains('sel') ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });

  window.addEventListener('online', () => {
    updateConnectionBadge?.(true);
    showToast('عاد الاتصال بالإنترنت', 'success');
  });
  window.addEventListener('offline', () => {
    updateConnectionBadge?.(false);
    showToast('تم فقدان الاتصال بالإنترنت', 'error');
  });
  updateConnectionBadge?.(navigator.onLine);
}
