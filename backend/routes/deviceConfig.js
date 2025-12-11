import express from 'express';
import {
  saveDeviceConfig,
  getDeviceConfig,
  getDeviceConfigRaw,
} from '../controllers/deviceConfigController.js';

const router = express.Router();

/**
 * @route   POST /api/device-config
 * @desc    حفظ إعدادات جهاز ESP32
 * @access  Public
 */
router.post('/', saveDeviceConfig);

/**
 * @route   GET /api/device-config/:device_id
 * @desc    جلب إعدادات جهاز (آمن - لا يعيد كلمة المرور)
 * @access  Public
 */
router.get('/:device_id', getDeviceConfig);

/**
 * @route   GET /api/device-config/:device_id/raw
 * @desc    جلب إعدادات جهاز (للاستخدام من ESP32 - يعيد كلمة المرور)
 * @access  Public
 */
router.get('/:device_id/raw', getDeviceConfigRaw);

export default router;

