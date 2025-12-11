import express from 'express';
import {
  receiveSensorData,
  getReadings,
  getLatestReading,
  getReadingsStats,
} from '../controllers/sensorsController.js';

const router = express.Router();

/**
 * @route   POST /api/sensors
 * @desc    استقبال بيانات الحساسات من ESP32
 * @access  Public
 * @body    { mq2_raw, mq2_percent, temp_ambient, temp_object, pulse_raw, device_id? }
 */
router.post('/sensors', receiveSensorData);

/**
 * @route   GET /api/readings
 * @desc    جلب قراءات الحساسات
 * @access  Public
 * @query   limit, orderBy, device_id
 */
router.get('/readings', getReadings);

/**
 * @route   GET /api/readings/latest
 * @desc    جلب آخر قراءة
 * @access  Public
 * @query   device_id (optional)
 */
router.get('/readings/latest', getLatestReading);

/**
 * @route   GET /api/readings/stats
 * @desc    جلب إحصائيات القراءات
 * @access  Public
 */
router.get('/readings/stats', getReadingsStats);

export default router;


