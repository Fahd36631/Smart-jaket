import express from 'express';
import {
  addPersonnel,
  getPersonnel,
  updatePersonnel,
  deletePersonnel,
  getPersonnelByDevice,
} from '../controllers/personnelController.js';

const router = express.Router();

/**
 * @route   POST /api/personnel
 * @desc    إضافة فرد جديد
 * @access  Public
 */
router.post('/', addPersonnel);

/**
 * @route   GET /api/personnel
 * @desc    جلب جميع الأفراد
 * @access  Public
 */
router.get('/', getPersonnel);

/**
 * @route   GET /api/personnel/device/:device_id
 * @desc    جلب معلومات فرد حسب device_id
 * @access  Public
 */
router.get('/device/:device_id', getPersonnelByDevice);

/**
 * @route   PUT /api/personnel/:id
 * @desc    تحديث معلومات فرد
 * @access  Public
 */
router.put('/:id', updatePersonnel);

/**
 * @route   DELETE /api/personnel/:id
 * @desc    حذف فرد
 * @access  Public
 */
router.delete('/:id', deletePersonnel);

export default router;


