import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// الحصول على مسار المجلد الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// تهيئة Firebase Admin SDK
let firebaseApp;

try {
  // التحقق من عدم تهيئة Firebase مسبقاً
  if (admin.apps.length === 0) {
    let credential;

    // الخيار 1: استخدام ملف JSON مباشرة (إذا كان موجوداً)
    const jsonKeyPath = join(__dirname, '..', 'smart-project2-fb297-firebase-adminsdk-fbsvc-989afcf8c0.json');
    try {
      const serviceAccount = JSON.parse(readFileSync(jsonKeyPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('✅ تم تحميل Firebase credentials من ملف JSON');
    } catch (jsonError) {
      // الخيار 2: استخدام متغيرات البيئة
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.error('❌ خطأ: متغيرات Firebase البيئية مفقودة!');
        console.error('يرجى التأكد من وجود: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
        console.error('أو ضع ملف Service Account JSON في مجلد backend');
        process.exit(1);
      }

      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      });
      console.log('✅ تم تحميل Firebase credentials من متغيرات البيئة');
    }

    firebaseApp = admin.initializeApp({
      credential: credential,
    });
    console.log('✅ تم تهيئة Firebase Admin SDK بنجاح');
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('❌ خطأ في تهيئة Firebase:', error.message);
  throw error;
}

// تصدير Firestore instance
export const db = admin.firestore();

// تصدير Firebase App للاستخدام في أماكن أخرى إذا لزم الأمر
export default firebaseApp;

