// visits.js - Visit management functions
function openAddVisitForPatient(patientId) {
  currentProfileId = patientId;
  openAddVisitModal();
}

function openAddVisitModal() {
  document.getElementById('inp_visitPatient').value = currentProfileId || '';
  document.querySelectorAll('#modalAddVisit input, #modalAddVisit select, #modalAddVisit textarea').forEach(el => el.value = '');
  document.querySelectorAll('.err-msg').forEach(el => el.style.display = 'none');
  toggleServiceFields();
  document.getElementById('modalAddVisit').classList.add('open');
}

function toggleServiceFields() {
  const service = document.getElementById('inp_visitService').value;
  document.getElementById('hijamaTypeWrap').style.display = service.includes('حجامة') ? 'block' : 'none';
  document.getElementById('bpFields').style.display = service.includes('ضغط') ? 'block' : 'none';
  document.getElementById('bsFields').style.display = service.includes('سكر') ? 'block' : 'none';
}

function autoCalcBP() {
  const sys = parseInt(document.getElementById('inp_bpSystolic').value) || 0;
  const dia = parseInt(document.getElementById('inp_bpDiastolic').value) || 0;
  let status = 'normal';
  if (sys < 90 || dia < 60) status = 'low';
  else if (sys >= 180 || dia >= 120) status = 'crisis';
  else if (sys >= 140 || dia >= 90) status = 'high';
  else if (sys >= 130 || dia >= 80) status = 'high_normal';
  document.getElementById('inp_bpStatus').value = status;
}

function saveVisit() {
  const patientId = document.getElementById('inp_visitPatient').value;
  const service = document.getElementById('inp_visitService').value;
  const date = document.getElementById('inp_visitDate').value;
  const details = document.getElementById('inp_visitDetails').value.trim();

  if (!patientId || !service || !date) {
    if (!patientId) document.getElementById('err_visitPatient').style.display = 'block';
    if (!service) document.getElementById('err_visitService').style.display = 'block';
    if (!date) document.getElementById('err_visitDate').style.display = 'block';
    return;
  }

  let visitData = { patientId, service, date, notes: details };

  if (service.includes('حجامة')) {
    visitData.hijamaType = document.getElementById('inp_hijamaType').value;
  }

  if (service.includes('ضغط')) {
    visitData.bp = {
      systolic: parseInt(document.getElementById('inp_bpSystolic').value),
      diastolic: parseInt(document.getElementById('inp_bpDiastolic').value),
      pulse: parseInt(document.getElementById('inp_bpPulse').value),
      status: document.getElementById('inp_bpStatus').value
    };
  }

  if (service.includes('سكر')) {
    visitData.bs = {
      level: parseFloat(document.getElementById('inp_bsLevel').value),
      measureTime: document.getElementById('inp_bsMeasureTime').value,
      context: document.getElementById('inp_bsContext').value,
      timeAfterMeal: document.getElementById('inp_bsTimeAfterMeal').value
    };
  }

  const id = uid();
  dbData.visits[id] = visitData;

  saveToFirebase();
  closeModal('modalAddVisit');
  loadDashboard();
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