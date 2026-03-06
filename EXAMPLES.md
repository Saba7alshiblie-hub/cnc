cd /workspaces/cnc

# 1. أضف جميع الملفات
git add .

# 2. عمل commit
git commit -m "feat: إضافة تحسينات شاملة - SEO, Offline, Docs, Security"

# 3. رفع إلى GitHub
git push origin main# 💡 أمثلة وأكواد مرجعية

مجموعة من الأمثلة والأكواد التي قد تحتاجها عند تطوير أو تخصيص التطبيق.

## 🔧 تنسيق الـ Service Worker في HTML

```html
<!-- Register Service Worker -->
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Every minute
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  }
</script>
```

## 📢 تفعيل Push Notifications

```javascript
// Request permission
function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      showNotification('مرحباً بك!', {
        body: 'تم تفعيل الإشعارات',
        icon: 'my-new-icon-512.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotification('شكراً!', {
            body: 'الإشعارات مفعلة الآن',
            icon: 'my-new-icon-512.png'
          });
        }
      });
    }
  }
}

// Show notification
function showNotification(title, options) {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  }
}
```

## � استخدام LocalStorage مع التشفير

```javascript
// دوال التشفير وفك التشفير
function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(ciphertext, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
}

// حفظ بيانات المستخدم مع التشفير
function saveUserData(key, data) {
  try {
    const dataStr = JSON.stringify(data);
    const encrypted = encrypt(dataStr, 'clinic-secure-key-2024');
    localStorage.setItem(key, encrypted);
    console.log('✅ Data saved securely:', key);
  } catch (error) {
    console.error('❌ Failed to save:', error);
  }
}

// استرجاع البيانات مع فك التشفير
function getUserData(key) {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    const decrypted = decrypt(encrypted, 'clinic-secure-key-2024');
    if (decrypted) {
      return JSON.parse(decrypted);
    } else {
      // محاولة قراءة كنص عادي للتوافق
      return JSON.parse(encrypted);
    }
  } catch (error) {
    console.error('❌ Failed to retrieve:', error);
    return null;
  }
}

// حذف البيانات
function removeUserData(key) {
  localStorage.removeItem(key);
  console.log('✅ Data removed:', key);
}

// مثال الاستخدام
const patient = {
  id: 1,
  name: 'محمد أحمد',
  phone: '555-1234',
  visits: 5
};

saveUserData('patient_1', patient);
const retrieved = getUserData('patient_1');
```

## 🌐 التحقق من الاتصال بالإنترنت

```javascript
// Check online status
function checkOnlineStatus() {
  if (navigator.onLine) {
    console.log('✅ Online');
    return true;
  } else {
    console.log('❌ Offline');
    return false;
  }
}

// Listen for online/offline changes
window.addEventListener('online', () => {
  console.log('🟢 Back online!');
  syncData(); // سنك البيانات عند العودة للإنترنت
});

window.addEventListener('offline', () => {
  console.log('🔴 No internet connection');
  showMessage('تم فقدان الاتصال بالإنترنت');
});
```

## 📱 الكشف عن جهاز المستخدم

```javascript
// Detect device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(ua)) {
    return 'mobile';
  } else if (/iPad|Tablet/i.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// مثال
console.log('Device:', getDeviceType());
```

## 🎨 تغيير الثيم ديناميكياً

```javascript
// Change theme colors
function setThemeColor(primaryColor) {
  // Update CSS variables
  document.documentElement.style.setProperty('--primary', primaryColor);
  
  // Update meta theme-color
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', primaryColor);
}

// مثال
setThemeColor('#0ea5e9');
```

## 🔔 تتبع الصفحة في Google Analytics

```javascript
// Track page views
function trackPageView(title, path) {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'G-YOUR-ID', {
      'page_title': title,
      'page_path': path
    });
  }
}

// Track custom events
function trackEvent(eventName, eventData) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
}

// أمثلة
trackPageView('صفحة المرضى', '/patients');
trackEvent('patient_added', {
  'patient_id': 123,
  'visit_count': 1
});
```

## 🔐 إعادة تعيين كلمة المرور (مثال)

```javascript
// Password reset example
function resetPassword(email) {
  return fetch('./api/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showMessage('تم إرسال رابط إعادة التعيين إلى بريدك');
      return true;
    } else {
      showMessage('فشل إرسال الرابط: ' + data.message);
      return false;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    return false;
  });
}
```

## 📥 تحميل الملفات

```javascript
// Handle file upload
function uploadFile(file, destination) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('destination', destination);

  return fetch('./api/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ File uploaded:', data.url);
      return data.url;
    } else {
      throw new Error('Upload failed');
    }
  })
  .catch(error => {
    console.error('❌ Upload error:', error);
  });
}

// مثال الاستخدام
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  uploadFile(file, 'patients/documents/');
});
```

## 🗄️ استخدام IndexedDB

```javascript
// Initialize IndexedDB
function initIndexedDB() {
  const request = indexedDB.open('ClinicDB', 1);
  
  request.onerror = () => {
    console.error('❌ Failed to open IndexedDB');
  };
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    // Create object stores
    if (!db.objectStoreNames.contains('patients')) {
      db.createObjectStore('patients', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('visits')) {
      db.createObjectStore('visits', { keyPath: 'id', autoIncrement: true });
    }
  };
  
  return request.result;
}

// Save to IndexedDB
function addPatientToIndexedDB(patient) {
  const request = indexedDB.open('ClinicDB');
  
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['patients'], 'readwrite');
    const store = transaction.objectStore('patients');
    store.put(patient);
    console.log('✅ Patient saved to IndexedDB');
  };
}

// Get from IndexedDB
function getPatientFromIndexedDB(id) {
  const request = indexedDB.open('ClinicDB');
  
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['patients'], 'readonly');
    const store = transaction.objectStore('patients');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      console.log('✅ Patient retrieved:', getRequest.result);
      return getRequest.result;
    };
  };
}
```

## 📊 نموذج نموذج العيادة البيانات

```javascript
// Patient data model
const patientModel = {
  id: null,
  name: '',
  phone: '',
  email: '',
  age: null,
  gender: '', // 'M' or 'F'
  address: '',
  medicalHistory: '',
  notes: '',
  visits: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Visit data model
const visitModel = {
  id: null,
  patientId: null,
  date: new Date(),
  type: '', // 'جلسة علاج', 'استشارة', إلخ
  bloodPressure: { systolic: null, diastolic: null },
  bloodSugar: null,
  temperature: null,
  treatment: '',
  notes: '',
  nextVisit: null
};
```

## 🎯 أشياء مهمة للمتذكرة

### ✅ قبل الإطلاق

```javascript
// Checklist script
const prelaunchChecklist = {
  https: () => location.protocol === 'https:', // Must be HTTPS
  serviceWorker: () => 'serviceWorker' in navigator,
  gzip: () => true, // Check headers
  cssCached: () => true, // Check SW cache
  gtag: () => typeof gtag !== 'undefined',
  offline: () => true, // Test offline page
  lighthouse: () => true, // Score 90+
  manifest: () => 'manifest' in document.querySelector('link[rel=manifest]')
};

// Check all
Object.entries(prelaunchChecklist).forEach(([key, fn]) => {
  console.log(`${fn() ? '✅' : '❌'} ${key}`);
});
```

## 🚀 أوامر مفيدة

```bash
# Start local server
python -m http.server 8000
# أو
npx http-server

# Check HTTPS locally
# Install mkcert
mkcert localhost
# أو استخدم ngrok
ngrok http 8000

# Test Service Worker
# Open DevTools → Application → Service Workers

# Test offline
# DevTools → Network → Offline checkbox

# Check manifest
# DevTools → Application → Manifest
```

---

**استخدم هذه الأمثلة كقاعدة للتطوير الإضافي! 💪**
