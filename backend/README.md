# Smart Jacket Backend API

نظام Backend متكامل لاستقبال ومعالجة بيانات السترة الذكية (Smart Jacket) المزوّدة بحساسات مختلفة.

## 📋 نظرة عامة

هذا المشروع يوفر واجهة برمجية (API) لاستقبال بيانات الحساسات من ESP32 وتخزينها في Firebase Firestore، مما يتيح للواجهة الأمامية عرض البيانات بشكل لحظي.

## 🔧 التقنيات المستخدمة

- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الويب
- **Firebase Admin SDK** - للتفاعل مع Firestore
- **CORS** - لدعم الطلبات من الواجهة الأمامية

## 📦 التثبيت

1. **استنساخ المشروع** (إذا لم يكن موجوداً):
```bash
cd backend
```

2. **تثبيت الحزم**:
```bash
npm install
```

3. **إعداد متغيرات البيئة**:
   - انسخ ملف `env.example` إلى `.env`
   - املأ القيم المطلوبة من Firebase Console

```bash
cp env.example .env
```

4. **الحصول على بيانات Firebase**:
   - اذهب إلى [Firebase Console](https://console.firebase.google.com/)
   - اختر مشروعك أو أنشئ مشروع جديد
   - اذهب إلى **Project Settings** > **Service Accounts**
   - اضغط على **Generate New Private Key**
   - انسخ القيم إلى ملف `.env`

## 🚀 التشغيل

### التطوير
```bash
npm run dev
```

### الإنتاج
```bash
npm start
```

الخادم سيعمل على `http://localhost:3000` (أو المنفذ المحدد في `.env`)

## 📡 API Endpoints

### 1. استقبال بيانات الحساسات
```
POST /api/sensors
```

**Body (JSON):**
```json
{
  "mq2_raw": 450,
  "mq2_percent": 25.5,
  "temp_ambient": 28.3,
  "temp_object": 36.8,
  "pulse_raw": 85,
  "device_id": "ESP32-001" // اختياري
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم حفظ البيانات بنجاح",
  "reading_id": "abc123",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

### 2. جلب القراءات
```
GET /api/readings
```

**Query Parameters:**
- `limit` (اختياري): عدد السجلات (افتراضي: 100)
- `orderBy` (اختياري): `asc` أو `desc` (افتراضي: `desc`)
- `device_id` (اختياري): فلترة حسب معرف الجهاز

**Example:**
```
GET /api/readings?limit=50&orderBy=desc&device_id=ESP32-001
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "readings": [
    {
      "id": "abc123",
      "mq2_raw": 450,
      "mq2_percent": 25.5,
      "temp_ambient": 28.3,
      "temp_object": 36.8,
      "pulse_raw": 85,
      "device_id": "ESP32-001",
      "created_at": "2025-01-20T10:30:00.000Z"
    }
  ]
}
```

### 3. جلب آخر قراءة
```
GET /api/readings/latest
```

**Query Parameters:**
- `device_id` (اختياري): معرف الجهاز

**Response:**
```json
{
  "success": true,
  "reading": {
    "id": "abc123",
    "mq2_raw": 450,
    "mq2_percent": 25.5,
    "temp_ambient": 28.3,
    "temp_object": 36.8,
    "pulse_raw": 85,
    "device_id": "ESP32-001",
    "created_at": "2025-01-20T10:30:00.000Z"
  }
}
```

### 4. جلب الإحصائيات
```
GET /api/readings/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1000,
    "latest": { /* آخر قراءة */ },
    "averages": {
      "mq2_percent": 25.5,
      "temp_ambient": 28.3,
      "temp_object": 36.8,
      "pulse_raw": 85
    }
  }
}
```

### 5. Health Check
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

## 🗄️ هيكلة قاعدة البيانات Firestore

```
/readings
  └── {autoID}
      ├── mq2_raw: number
      ├── mq2_percent: number
      ├── temp_ambient: number
      ├── temp_object: number
      ├── pulse_raw: number
      ├── device_id: string
      └── created_at: Timestamp
```

## 🔐 الأمان

- **CORS**: تم تكوين CORS لدعم الواجهة الأمامية
- **Firebase Security Rules**: يجب إعداد قواعد الأمان في Firebase Console
- **Environment Variables**: جميع البيانات الحساسة مخزنة في `.env`

### مثال على Firebase Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /readings/{document=**} {
      allow read: if true; // للواجهة الأمامية
      allow write: if false; // الكتابة فقط من خلال Backend
    }
  }
}
```

## 📝 مثال على كود ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverURL = "https://your-backend-url.com/api/sensors";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // قراءة الحساسات
    int mq2_raw = analogRead(A0);
    float mq2_percent = (mq2_raw / 4095.0) * 100;
    float temp_ambient = readMLX90614Ambient();
    float temp_object = readMLX90614Object();
    int pulse_raw = readHW827();
    
    // إرسال البيانات
    String jsonData = "{";
    jsonData += "\"mq2_raw\":" + String(mq2_raw) + ",";
    jsonData += "\"mq2_percent\":" + String(mq2_percent) + ",";
    jsonData += "\"temp_ambient\":" + String(temp_ambient) + ",";
    jsonData += "\"temp_object\":" + String(temp_object) + ",";
    jsonData += "\"pulse_raw\":" + String(pulse_raw) + ",";
    jsonData += "\"device_id\":\"ESP32-001\"";
    jsonData += "}";
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }
    
    http.end();
  }
  
  delay(5000); // إرسال كل 5 ثواني
}
```

## 🚢 النشر

### Render.com
1. اربط مستودع GitHub
2. حدد `backend` كـ Root Directory
3. أضف متغيرات البيئة من `.env`
4. Build Command: `npm install`
5. Start Command: `npm start`

### Vercel
1. ثبت Vercel CLI: `npm i -g vercel`
2. في مجلد `backend`: `vercel`
3. أضف متغيرات البيئة في Vercel Dashboard

### Heroku
1. ثبت Heroku CLI
2. `heroku create your-app-name`
3. `heroku config:set FIREBASE_PROJECT_ID=...` (لجميع المتغيرات)
4. `git push heroku main`

## 🐛 استكشاف الأخطاء

### خطأ في تهيئة Firebase
- تأكد من صحة `FIREBASE_PRIVATE_KEY` (يجب أن يحتوي على `\n` للأسطر الجديدة)
- تأكد من صحة `FIREBASE_CLIENT_EMAIL` و `FIREBASE_PROJECT_ID`

### خطأ CORS
- تأكد من إعداد `FRONTEND_URL` في `.env`
- في الإنتاج، حدد URL الواجهة الأمامية بدقة

### البيانات لا تظهر في Firestore
- تحقق من Firebase Console > Firestore Database
- تأكد من تفعيل Firestore في مشروعك
- تحقق من قواعد الأمان

## 📞 الدعم

للمساعدة أو الاستفسارات، يرجى فتح Issue في المستودع.

## 📄 الترخيص

ISC


