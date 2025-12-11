import { useState, useEffect } from "react";
import { usePersonnel } from "../hooks/usePersonnel";

interface DeviceConfig {
  device_id: string;
  ssid: string;
  password: string;
  server_url: string;
}

const DeviceSettingsPage = () => {
  const { personnel } = usePersonnel();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [config, setConfig] = useState<DeviceConfig>({
    device_id: "",
    ssid: "",
    password: "",
    server_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Backend URL - يمكن جلبها من .env
  const backendURL = import.meta.env.VITE_BACKEND_URL || "https://smart-jacket-backend.onrender.com";

  useEffect(() => {
    if (selectedDevice) {
      loadConfig(selectedDevice);
    }
  }, [selectedDevice]);

  const loadConfig = async (deviceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendURL}/api/device-config/${deviceId}`);
      const data = await response.json();

      if (data.success && data.config) {
        setConfig({
          device_id: data.config.device_id || deviceId,
          ssid: data.config.ssid || "",
          password: "", // لا نعرض كلمة المرور
          server_url: data.config.server_url || "",
        });
      } else {
        // إعدادات افتراضية
        setConfig({
          device_id: deviceId,
          ssid: "",
          password: "",
          server_url: `${backendURL}/api/sensors`,
        });
      }
    } catch (err) {
      console.error("Error loading config:", err);
      setError("فشل تحميل الإعدادات");
      // إعدادات افتراضية
      setConfig({
        device_id: deviceId,
        ssid: "",
        password: "",
        server_url: `${backendURL}/api/sensors`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!config.device_id) {
      setError("يرجى اختيار جهاز");
      setLoading(false);
      return;
    }

    if (!config.ssid || !config.password || !config.server_url) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendURL}/api/device-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: config.device_id,
          ssid: config.ssid,
          password: config.password,
          server_url: config.server_url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ تم حفظ الإعدادات بنجاح! سيتم تطبيقها على الجهاز خلال دقيقة.");
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      } else {
        setError(data.message || "فشل حفظ الإعدادات");
      }
    } catch (err) {
      console.error("Error saving config:", err);
      setError("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof DeviceConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // استخراج Device IDs من الأفراد
  const deviceIds = Array.from(
    new Set(personnel.map((p) => p.device_id).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الأجهزة</h1>
          <p className="mt-2 text-sm text-gray-600">
            قم بتحديث إعدادات WiFi و Server URL للأجهزة عن بُعد
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اختيار الجهاز */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                اختر الجهاز (Device ID)
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
                required
              >
                <option value="">-- اختر جهاز --</option>
                {deviceIds.map((deviceId) => (
                  <option key={deviceId} value={deviceId}>
                    {deviceId}
                  </option>
                ))}
              </select>
              {deviceIds.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  لا توجد أجهزة متاحة. أضف فرداً أولاً في قائمة الأفراد.
                </p>
              )}
            </div>

            {selectedDevice && (
              <>
                {/* WiFi SSID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    اسم شبكة WiFi (SSID)
                  </label>
                  <input
                    type="text"
                    value={config.ssid}
                    onChange={(e) => handleChange("ssid", e.target.value)}
                    placeholder="مثال: MyWiFi"
                    className="w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
                    required
                  />
                </div>

                {/* WiFi Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    كلمة مرور WiFi
                  </label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
                    required
                  />
                </div>

                {/* Server URL */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    رابط الخادم (Server URL)
                  </label>
                  <input
                    type="url"
                    value={config.server_url}
                    onChange={(e) => handleChange("server_url", e.target.value)}
                    placeholder="http://your-backend-url/api/sensors"
                    className="w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    مثال: http://192.168.1.100:3000/api/sensors أو
                    https://your-app.onrender.com/api/sensors
                  </p>
                </div>

                {/* Device ID (read-only) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    معرف الجهاز (Device ID)
                  </label>
                  <input
                    type="text"
                    value={config.device_id}
                    readOnly
                    className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600"
                  />
                </div>
              </>
            )}

            {/* Messages */}
            {error && (
              <div className="rounded-2xl bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-status-safe/10 px-4 py-3 text-sm text-status-safe">
                {message}
              </div>
            )}

            {/* Submit Button */}
            {selectedDevice && (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDevice("");
                    setConfig({
                      device_id: "",
                      ssid: "",
                      password: "",
                      server_url: "",
                    });
                    setError(null);
                    setMessage(null);
                  }}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-brand-dark px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-3xl bg-blue-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            📝 تعليمات
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • اختر الجهاز من القائمة (يجب أن يكون الفرد مضافاً مسبقاً)
            </li>
            <li>
              • أدخل إعدادات WiFi و Server URL
            </li>
            <li>
              • اضغط "حفظ الإعدادات" - سيتم تطبيقها على الجهاز خلال دقيقة
            </li>
            <li>
              • الجهاز يتحقق من الإعدادات تلقائياً كل دقيقة
            </li>
            <li>
              • يمكنك تغيير الإعدادات في أي وقت دون الحاجة لتعديل كود ESP32
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettingsPage;

