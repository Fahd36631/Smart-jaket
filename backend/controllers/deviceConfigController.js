import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * حفظ إعدادات جهاز ESP32
 * @route POST /api/device-config
 */
export const saveDeviceConfig = async (req, res) => {
  try {
    const { device_id, ssid, password, server_url } = req.body;

    if (!device_id) {
      return res.status(400).json({
        success: false,
        error: 'بيانات ناقصة',
        message: 'يرجى إرسال device_id',
      });
    }

    const configData = {
      device_id: String(device_id),
      ssid: ssid ? String(ssid) : null,
      password: password ? String(password) : null,
      server_url: server_url ? String(server_url) : null,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // البحث عن إعدادات موجودة لهذا الجهاز
    const existingConfig = await db
      .collection('device_configs')
      .where('device_id', '==', device_id)
      .limit(1)
      .get();

    let docRef;
    if (!existingConfig.empty) {
      // تحديث الإعدادات الموجودة
      docRef = existingConfig.docs[0].ref;
      await docRef.update(configData);
      console.log(`✅ تم تحديث إعدادات الجهاز: ${device_id}`);
    } else {
      // إنشاء إعدادات جديدة
      configData.created_at = admin.firestore.FieldValue.serverTimestamp();
      docRef = await db.collection('device_configs').add(configData);
      console.log(`✅ تم إنشاء إعدادات جديدة للجهاز: ${device_id}`);
    }

    res.status(200).json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      config_id: docRef.id,
      data: configData,
    });
  } catch (error) {
    console.error('❌ خطأ في حفظ الإعدادات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * جلب إعدادات جهاز ESP32
 * @route GET /api/device-config/:device_id
 */
export const getDeviceConfig = async (req, res) => {
  try {
    const { device_id } = req.params;

    const snapshot = await db
      .collection('device_configs')
      .where('device_id', '==', device_id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات لهذا الجهاز',
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // إخفاء كلمة المرور في الاستجابة
    const safeData = {
      ...data,
      password: data.password ? '***' : null,
    };

    res.status(200).json({
      success: true,
      config: {
        id: doc.id,
        ...safeData,
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الإعدادات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * جلب إعدادات جهاز ESP32 (للاستخدام من ESP32 - يعيد كلمة المرور)
 * @route GET /api/device-config/:device_id/raw
 */
export const getDeviceConfigRaw = async (req, res) => {
  try {
    const { device_id } = req.params;

    const snapshot = await db
      .collection('device_configs')
      .where('device_id', '==', device_id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات لهذا الجهاز',
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      success: true,
      config: {
        device_id: data.device_id,
        ssid: data.ssid,
        password: data.password,
        server_url: data.server_url,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الإعدادات:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

