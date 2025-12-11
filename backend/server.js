import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sensorRoutes from './routes/sensors.js';
import personnelRoutes from './routes/personnel.js';
import deviceConfigRoutes from './routes/deviceConfig.js';
import bluetoothRoutes from './routes/bluetooth.js';

// تحميل متغيرات البيئة
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // في الإنتاج، حدد URL الواجهة الأمامية
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Jacket Backend API',
    version: '1.0.0',
    endpoints: {
      'POST /api/sensors': 'استقبال بيانات الحساسات من ESP32',
      'GET /api/readings': 'جلب قراءات الحساسات',
      'GET /api/readings/latest': 'جلب آخر قراءة',
      'GET /api/readings/stats': 'جلب إحصائيات القراءات',
      'POST /api/personnel': 'إضافة فرد جديد',
      'GET /api/personnel': 'جلب جميع الأفراد',
      'GET /api/personnel/device/:device_id': 'جلب معلومات فرد حسب device_id',
      'PUT /api/personnel/:id': 'تحديث معلومات فرد',
      'DELETE /api/personnel/:id': 'حذف فرد',
      'POST /api/device-config': 'حفظ إعدادات جهاز ESP32',
      'GET /api/device-config/:device_id': 'جلب إعدادات جهاز (آمن)',
      'GET /api/device-config/:device_id/raw': 'جلب إعدادات جهاز (للاستخدام من ESP32)',
    },
  });
});

// API Routes
app.use('/api', sensorRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/device-config', deviceConfigRoutes);
app.use('/api/bluetooth', bluetoothRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `المسار ${req.path} غير موجود`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ خطأ في الخادم:', err);
  res.status(err.status || 500).json({
    success: false,
    error: 'خطأ في الخادم',
    message: process.env.NODE_ENV === 'development' ? err.message : 'حدث خطأ داخلي',
  });
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`📍 API متاح على: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;

