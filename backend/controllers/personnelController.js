import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * إضافة فرد جديد
 * @route POST /api/personnel
 */
export const addPersonnel = async (req, res) => {
  try {
    const { name, rank, unit, phone, device_id, personnel_id } = req.body;

    if (!name || !rank || !unit || !device_id) {
      return res.status(400).json({
        success: false,
        error: 'بيانات ناقصة',
        message: 'يرجى إرسال: name, rank, unit, device_id',
      });
    }

    const personnelData = {
      name: String(name),
      rank: String(rank),
      unit: String(unit),
      phone: phone ? String(phone) : null,
      device_id: String(device_id),
      personnel_id: personnel_id || `P-${Date.now()}`,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // حفظ في collection "personnel"
    const docRef = await db.collection('personnel').add(personnelData);

    console.log(`✅ تم إضافة فرد جديد: ${docRef.id}`);

    res.status(201).json({
      success: true,
      message: 'تم إضافة الفرد بنجاح',
      personnel_id: docRef.id,
      data: personnelData,
    });
  } catch (error) {
    console.error('❌ خطأ في إضافة الفرد:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * جلب جميع الأفراد
 * @route GET /api/personnel
 */
export const getPersonnel = async (req, res) => {
  try {
    const snapshot = await db.collection('personnel').orderBy('created_at', 'desc').get();

    const personnel = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
      };
    });

    res.status(200).json({
      success: true,
      count: personnel.length,
      personnel,
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الأفراد:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * تحديث معلومات فرد
 * @route PUT /api/personnel/:id
 */
export const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rank, unit, phone, device_id } = req.body;

    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name) updateData.name = String(name);
    if (rank) updateData.rank = String(rank);
    if (unit) updateData.unit = String(unit);
    if (phone !== undefined) updateData.phone = phone ? String(phone) : null;
    if (device_id) updateData.device_id = String(device_id);

    await db.collection('personnel').doc(id).update(updateData);

    res.status(200).json({
      success: true,
      message: 'تم تحديث معلومات الفرد بنجاح',
    });
  } catch (error) {
    console.error('❌ خطأ في تحديث الفرد:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * حذف فرد
 * @route DELETE /api/personnel/:id
 */
export const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('personnel').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'تم حذف الفرد بنجاح',
    });
  } catch (error) {
    console.error('❌ خطأ في حذف الفرد:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};

/**
 * جلب معلومات فرد حسب device_id
 * @route GET /api/personnel/device/:device_id
 */
export const getPersonnelByDevice = async (req, res) => {
  try {
    const { device_id } = req.params;

    const snapshot = await db
      .collection('personnel')
      .where('device_id', '==', device_id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على فرد مرتبط بهذا الجهاز',
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      success: true,
      personnel: {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب معلومات الفرد:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message,
    });
  }
};


