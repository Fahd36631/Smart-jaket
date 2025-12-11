import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * استقبال بيانات الحساسات من Bluetooth وحفظها في Firestore
 * يمكن استخدام هذا مع تطبيق Bluetooth على الهاتف
 * @route POST /api/bluetooth
 */
export const receiveBluetoothData = async (req, res) => {
  try {
    const { mq2_raw, mq2_percent, temp_ambient, temp_object, pulse_raw, device_id } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (
      mq2_raw === undefined ||
      mq2_percent === undefined ||
      temp_ambient === undefined ||
      temp_object === undefined ||
      pulse_raw === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'بيانات ناقصة',
        message: 'يرجى إرسال جميع الحقول المطلوبة',
      });
    }

    // إنشاء سجل جديد في Firestore
    const readingData = {
      mq2_raw: Number(mq2_raw),
      mq2_percent: Number(mq2_percent),
      temp_ambient: Number(temp_ambient),
      temp_object: Number(temp_object),
      pulse_raw: Number(pulse_raw),
      device_id: device_id || 'unknown',
      source: 'bluetooth', // إضافة مصدر البيانات
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // حفظ البيانات في collection "readings"
    const docRef = await db.collection('readings').add(readingData);

    console.log(`✅ تم حفظ قراءة Bluetooth جديدة: ${docRef.id}`);

    res.status(201).json({
      success: true,
      message: 'تم حفظ البيانات بنجاح',
      reading_id: docRef.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ خطأ في حفظ البيانات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

