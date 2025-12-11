import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * استقبال بيانات الحساسات من ESP32 وحفظها في Firestore
 * @route POST /api/sensors
 */
export const receiveSensorData = async (req, res) => {
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
        message: 'يرجى إرسال جميع الحقول المطلوبة: mq2_raw, mq2_percent, temp_ambient, temp_object, pulse_raw',
      });
    }

    // التحقق من صحة أنواع البيانات
    if (
      typeof mq2_raw !== 'number' ||
      typeof mq2_percent !== 'number' ||
      typeof temp_ambient !== 'number' ||
      typeof temp_object !== 'number' ||
      typeof pulse_raw !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        error: 'نوع بيانات غير صحيح',
        message: 'جميع القيم يجب أن تكون أرقام',
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
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // حفظ البيانات في collection "readings"
    const docRef = await db.collection('readings').add(readingData);

    // إرجاع الاستجابة الناجحة
    res.status(201).json({
      success: true,
      message: 'تم حفظ البيانات بنجاح',
      reading_id: docRef.id,
      device_id: readingData.device_id,
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

/**
 * جلب قراءات الحساسات من Firestore
 * @route GET /api/readings
 * @query limit - عدد السجلات المطلوبة (افتراضي: 100)
 * @query orderBy - ترتيب البيانات: 'desc' أو 'asc' (افتراضي: 'desc')
 * @query device_id - فلترة حسب معرف الجهاز (اختياري)
 */
export const getReadings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const orderBy = req.query.orderBy || 'desc';
    const deviceId = req.query.device_id;

    // بناء الاستعلام
    let query = db.collection('readings');

    // فلترة حسب device_id إذا تم توفيره
    if (deviceId) {
      query = query.where('device_id', '==', deviceId);
    }

    // ترتيب البيانات حسب created_at
    query = query.orderBy('created_at', orderBy === 'asc' ? 'asc' : 'desc');

    // تحديد الحد الأقصى
    query = query.limit(limit);

    // تنفيذ الاستعلام
    const snapshot = await query.get();

    // تحويل البيانات إلى مصفوفة
    const readings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
      };
    });

    res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * جلب آخر قراءة من Firestore
 * @route GET /api/readings/latest
 * @query device_id - معرف الجهاز (اختياري)
 */
export const getLatestReading = async (req, res) => {
  try {
    const deviceId = req.query.device_id;

    // بناء الاستعلام
    let query = db.collection('readings').orderBy('created_at', 'desc').limit(1);

    // إذا تم توفير device_id، نستخدم where بدلاً من orderBy
    if (deviceId) {
      query = db.collection('readings').where('device_id', '==', deviceId).orderBy('created_at', 'desc').limit(1);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد قراءات متاحة',
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      success: true,
      reading: {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب آخر قراءة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * جلب إحصائيات القراءات
 * @route GET /api/readings/stats
 */
export const getReadingsStats = async (req, res) => {
  try {
    const snapshot = await db.collection('readings').orderBy('created_at', 'desc').limit(1000).get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        stats: {
          total: 0,
          latest: null,
          averages: null,
        },
      });
    }

    const readings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
      };
    });

    const latest = readings[0];
    const averages = {
      mq2_percent: readings.reduce((sum, r) => sum + (r.mq2_percent || 0), 0) / readings.length,
      temp_ambient: readings.reduce((sum, r) => sum + (r.temp_ambient || 0), 0) / readings.length,
      temp_object: readings.reduce((sum, r) => sum + (r.temp_object || 0), 0) / readings.length,
      pulse_raw: readings.reduce((sum, r) => sum + (r.pulse_raw || 0), 0) / readings.length,
    };

    res.status(200).json({
      success: true,
      stats: {
        total: readings.length,
        latest,
        averages,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

