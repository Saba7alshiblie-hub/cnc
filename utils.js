// utils.js - Utility functions
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f472b6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
function getColor(name) { let h = 0; for (let c of (name || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff; return colors[h % colors.length]; }
function getLetter(name) { return (name || '?').trim()[0]; }
function fmtDate(d) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }); }
function today() { return new Date().toISOString().split('T')[0]; }
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  const icon = t.querySelector('i');
  if (icon && type === 'success') {
    icon.className = 'fas fa-check-circle';
  } else if (icon && type === 'error') {
    icon.className = 'fas fa-exclamation-circle';
  } else if (icon) {
    icon.className = 'fas fa-info-circle';
  }
  t.querySelector('span').textContent = msg;
  t.className = 'toast show ' + type;
  if (t.hideTimeout) clearTimeout(t.hideTimeout);
  t.hideTimeout = setTimeout(() => {
    t.classList.remove('show');
  }, 3000);
}
function objToArray(obj) { return obj ? Object.keys(obj).map(k => ({ id: k, ...obj[k] })) : []; }
function getPatientName(patientId) {
  const p = dbData.patients[patientId];
  return p ? p.name : 'مريض محذوف';
}
function getServiceType(s) { if (!s) return 'other'; if (s.includes('حجامة')) return 'hijama'; if (s.includes('ختان')) return 'khitan'; if (s.includes('عملية')) return 'surgery'; if (s.includes('ضغط')) return 'bp'; return 'other'; }
function tick() {
  const n = new Date();
  document.getElementById('clockDisplay').textContent = n.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('dateDisplay').textContent = n.toLocaleDateString('ar-IQ', { weekday: 'long', month: 'long', day: 'numeric' });
}
setInterval(tick, 1000); tick();

function handlePostLoginActions() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  if (!action) return;
  setTimeout(() => {
    if (action === 'new-patient') {
      openNewPatientModal();
    } else if (action === 'today-visits') {
      showPage('today');
    }
  }, 100);
  const newUrl = window.location.pathname;
  window.history.replaceState({}, document.title, newUrl);
}

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
  const toggle = document.getElementById('darkModeToggle');
  if (!toggle) return;
  if (document.body.classList.contains('dark-mode')) {
    toggle.innerHTML = '<i class="fas fa-sun"></i>';
    toggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    toggle.innerHTML = '<i class="fas fa-moon"></i>';
    toggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

function initDarkMode() {
  const saved = localStorage.getItem('darkMode') === 'true';
  if (saved) document.body.classList.add('dark-mode');
  updateDarkModeIcon();
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('تم تفعيل الإشعارات', 'success');
      }
    });
  }
}

function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

function exportData() {
  if (!clinicId || !dbData) {
    showToast('لا توجد بيانات للتصدير', 'error');
    return;
  }

  const exportData = {
    clinicId: clinicId,
    exportDate: new Date().toISOString(),
    patients: dbData.patients,
    visits: dbData.visits,
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clinic_backup_${clinicId}_${today()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('تم تصدير البيانات بنجاح', 'success');
}
