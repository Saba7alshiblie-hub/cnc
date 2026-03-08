// visits.js - Visit management functions
function openAddVisitForPatient(patientId) {
  currentProfileId = patientId;
  openAddVisitModal();
}

function openAddVisitModal() {
  const patientSelect = document.getElementById('inp_visitPatient');
  if (patientSelect) {
    patientSelect.value = currentProfileId || '';
  }

  document.getElementById('inp_visitService').value = '';
  document.getElementById('inp_visitDate').value = today();
  document.getElementById('inp_visitDetails').value = '';
  document.getElementById('inp_hijamaType').value = 'النوع الأول';
  document.getElementById('inp_bpSystolic').value = '';
  document.getElementById('inp_bpDiastolic').value = '';
  document.getElementById('inp_bpPulse').value = '';
  document.getElementById('inp_bpStatus').value = 'normal';
  document.getElementById('inp_bsLevel').value = '';
  document.getElementById('inp_bsMeasureTime').value = '';
  document.getElementById('inp_bsContext').value = 'صائم';
  document.getElementById('inp_bsTimeAfterMeal').value = '';
  document.querySelectorAll('#modalAddVisit .err-msg').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('show');
  });
  toggleServiceFields();
  document.getElementById('modalAddVisit').classList.add('open');
}

function toggleServiceFields() {
  const service = document.getElementById('inp_visitService').value;
  document.getElementById('hijamaTypeWrap').style.display = service === 'حجامة' ? 'block' : 'none';
  document.getElementById('bpFields').style.display = service === 'قياس ضغط الدم' ? 'block' : 'none';
  document.getElementById('bsFields').style.display = service === 'مراقبة سكر الدم' ? 'block' : 'none';
}

function autoCalcBP() {
  const sys = parseInt(document.getElementById('inp_bpSystolic').value) || 0;
  const dia = parseInt(document.getElementById('inp_bpDiastolic').value) || 0;
  if (!sys || !dia) return;

  let status = 'optimal';
  if (sys >= 180 || dia >= 110) status = 'grade3';
  else if (sys >= 160 || dia >= 100) status = 'grade2';
  else if (sys >= 140 || dia >= 90) status = 'grade1';
  else if (sys >= 130 || dia >= 85) status = 'high_normal';
  else if (sys >= 120 || dia >= 80) status = 'normal';

  if (sys >= 140 && dia < 90) status = 'isolated';
  document.getElementById('inp_bpStatus').value = status;
}

function setVisitFieldError(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? 'block' : 'none';
  el.classList.toggle('show', show);
}

function saveVisit() {
  const patientId = document.getElementById('inp_visitPatient').value;
  const service = document.getElementById('inp_visitService').value;
  const date = document.getElementById('inp_visitDate').value;
  const details = document.getElementById('inp_visitDetails').value.trim();

  if (!patientId || !service || !date) {
    setVisitFieldError('err_visitPatient', !patientId);
    setVisitFieldError('err_visitService', !service);
    setVisitFieldError('err_visitDate', !date);
    return;
  }
  setVisitFieldError('err_visitPatient', false);
  setVisitFieldError('err_visitService', false);
  setVisitFieldError('err_visitDate', false);

  let visitData = { patientId, service, date, notes: details };

  if (service === 'حجامة') {
    const hijamaType = document.getElementById('inp_hijamaType').value;
    visitData.hijamaType = hijamaType;
    visitData.service = 'حجامة - ' + hijamaType;
  }

  if (service === 'قياس ضغط الدم') {
    const sys = parseInt(document.getElementById('inp_bpSystolic').value);
    const dia = parseInt(document.getElementById('inp_bpDiastolic').value);
    if (!sys || !dia) {
      showToast('يرجى إدخال قيم ضغط الدم', 'error');
      return;
    }
    visitData.bp = {
      systolic: sys,
      diastolic: dia,
      pulse: parseInt(document.getElementById('inp_bpPulse').value) || null,
      status: document.getElementById('inp_bpStatus').value
    };
  }

  if (service === 'مراقبة سكر الدم') {
    const bsLevel = parseFloat(document.getElementById('inp_bsLevel').value);
    if (!bsLevel) {
      showToast('يرجى إدخال مستوى السكر', 'error');
      return;
    }
    visitData.bs = {
      level: bsLevel,
      time: document.getElementById('inp_bsMeasureTime').value,
      context: document.getElementById('inp_bsContext').value,
      timeAfterMeal: document.getElementById('inp_bsTimeAfterMeal').value
    };
  }

  const id = uid();
  dbData.visits[id] = visitData;

  saveToFirebase();
  closeModal('modalAddVisit');
  loadDashboard();
  loadTodayVisits();
  if (currentProfileId) showPatientProfile(currentProfileId);
  showToast('تم إضافة الزيارة');
}

function loadTodayVisits() {
  const todayVisits = objToArray(dbData.visits).filter(v => v.date === today());
  const grid = document.getElementById('todayGrid');
  grid.innerHTML = '';

  if (todayVisits.length === 0) {
    document.getElementById('todayEmpty').style.display = 'block';
    return;
  }

  document.getElementById('todayEmpty').style.display = 'none';

  todayVisits.forEach(visit => {
    const patient = dbData.patients[visit.patientId];
    if (!patient) return;
    const card = document.createElement('div');
    card.className = 'today-card';
    card.innerHTML = `
      <div class="tc-avatar" style="background: ${getColor(patient.name)}">${getLetter(patient.name)}</div>
      <div>
        <div class="tc-name">${patient.name}</div>
        <div style="font-size:14px;color:var(--gray-500);margin-top:4px;">${visit.service}</div>
        <div style="font-size:13px;color:var(--gray-400);margin-top:2px;">${patient.phone || '—'}</div>
      </div>
    `;
    card.onclick = () => showPatientProfile(visit.patientId);
    grid.appendChild(card);
  });
}

function showUpcomingReminders() {
  const reminders = objToArray(dbData.patients).filter(p => {
    const lastVisit = objToArray(dbData.visits).filter(v => v.patientId === p.id).sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    if (!lastVisit) return true;
    const daysSince = (new Date() - new Date(lastVisit.date)) / (1000 * 60 * 60 * 24);
    return daysSince > 30;
  });

  if (reminders.length === 0) {
    showToast('لا توجد تذكيرات', 'info');
    return;
  }

  let msg = 'المرضى الذين يحتاجون زيارة:\n';
  reminders.forEach(p => msg += `- ${p.name}\n`);
  alert(msg);
}
