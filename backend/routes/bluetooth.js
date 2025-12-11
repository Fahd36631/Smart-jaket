import express from 'express';
import { receiveBluetoothData } from '../controllers/bluetoothController.js';

const router = express.Router();

/**
 * @route   POST /api/bluetooth
 * @desc    استقبال بيانات الحساسات من Bluetooth
 * @access  Public
 */
router.post('/', receiveBluetoothData);

export default router;

