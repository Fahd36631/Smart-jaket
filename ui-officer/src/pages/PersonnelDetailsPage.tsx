import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import SensorCard from "../components/ui/SensorCard";
import StatusBadge from "../components/ui/StatusBadge";
import { usePersonnel } from "../hooks/usePersonnel";
import { useSensorReadings } from "../hooks/useSensorReadings";
import { mapReadingsToPersonnel } from "../lib/firebaseUtils";
import { formatDateTime } from "../lib/utils";

const PersonnelDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // دالة مساعدة لتحويل Timestamp (يجب تعريفها قبل الاستخدام)
  const timestampToISO = (ts: any): string => {
    if (ts instanceof Date) return ts.toISOString();
    if (typeof ts === 'string') return ts;
    if (ts && typeof ts === 'object' && 'toDate' in ts) {
      return ts.toDate().toISOString();
    }
    return new Date().toISOString();
  };

  // جلب البيانات الحقيقية من Firebase
  const { personnel: personnelList, loading: personnelLoading } = usePersonnel();
  const { readings, loading: readingsLoading } = useSensorReadings(undefined, 100);
  
  // تحويل البيانات إلى PersonnelRecords
  const allPersonnel = mapReadingsToPersonnel(readings, personnelList);
  
  // البحث عن الفرد المطلوب
  const person = allPersonnel.find((p) => p.id === id);
  
  const loading = personnelLoading || readingsLoading;

  // جلب تاريخ القراءات للفرد المحدد
  const personReadings = useMemo(() => {
    if (!person) return [];
    // البحث عن device_id للفرد
    const personnelInfo = personnelList.find((p) => 
      (p.personnel_id || p.id) === id
    );
    if (!personnelInfo) return [];
    
    return readings
      .filter((r) => r.device_id === personnelInfo.device_id)
      .slice(-20) // آخر 20 قراءة
      .reverse(); // من الأحدث للأقدم
  }, [person, readings, personnelList, id]);

  const heartHistory = useMemo(() => {
    if (personReadings.length === 0) {
      // إذا لم توجد قراءات، نستخدم بيانات افتراضية
      return Array.from({ length: 8 }).map((_, index) => ({
        time: `${10 - index}:0${(index * 3) % 6} صباحاً`,
        value: (person?.sensors.heartRate.value ?? 110) + Math.round(Math.sin(index) * 6),
      }));
    }
    // استخدام القراءات الحقيقية
    return personReadings.slice(0, 20).map((reading) => {
      const date = new Date(timestampToISO(reading.created_at));
      return {
        time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
        value: reading.pulse_raw,
      };
    });
  }, [personReadings, person]);

  const tempHistory = useMemo(() => {
    if (personReadings.length === 0) {
      // إذا لم توجد قراءات، نستخدم بيانات افتراضية
      return Array.from({ length: 8 }).map((_, index) => ({
        time: `${10 - index}:0${(index * 2) % 6} صباحاً`,
        value: (person?.sensors.temperature.value ?? 37.2) + Math.round(Math.sin(index) * 2) / 2,
      }));
    }
    // استخدام القراءات الحقيقية
    return personReadings.slice(0, 20).map((reading) => {
      const date = new Date(timestampToISO(reading.created_at));
      return {
        time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
        value: reading.temp_object,
      };
    });
  }, [personReadings, person]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-brand-dark" />
          <span className="text-gray-600">جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
        <p className="text-lg font-semibold text-gray-700">
          تعذر العثور على بيانات الفرد.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          تأكد من أن الفرد مضاف وأن البيانات تُرسل من السترة.
        </p>
        <button
          onClick={() => navigate("/personnel")}
          className="mt-6 rounded-2xl bg-brand-dark px-6 py-3 text-white"
        >
          الرجوع للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">بيانات الفرد</p>
            <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
            <p className="text-sm text-gray-500">
              {person.rank} • {person.unit}
            </p>
          </div>
          <StatusBadge state={person.status} />
        </div>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
          <p>
            <span className="text-gray-400">الرقم العسكري:</span> {person.id}
          </p>
          {person.phone && (
            <p>
              <span className="text-gray-400">الجوال:</span> {person.phone}
            </p>
          )}
          <p>
            <span className="text-gray-400">آخر تحديث:</span>{" "}
            {formatDateTime(person.lastReadingAt)}
          </p>
          <p>
            <span className="text-gray-400">الموقع:</span> {person.location.city}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SensorCard reading={person.sensors.temperature} />
        <SensorCard reading={person.sensors.heartRate} />
        <SensorCard reading={person.sensors.gasLeak} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HistoryChart title="سجل نبض القلب" data={heartHistory} color="#d82727" />
        <HistoryChart title="سجل درجة الحرارة" data={tempHistory} color="#f2b90c" />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm text-gray-500">الموقع الحالي</p>
        <h3 className="text-xl font-bold text-gray-900">
          {person.location.city} - محدث كل 15 ثانية
        </h3>
        <div className="mt-4 h-72 rounded-2xl bg-[url('https://tile.openstreetmap.org/8/141/96.png')] bg-cover bg-center" />
        <p className="mt-3 text-sm text-gray-500">
          في حال انقطاع الإشارة سيتم إشعارك فوراً لإعادة المحاولة.
        </p>
      </div>
    </div>
  );
};

const HistoryChart = ({
  title,
  data,
  color,
}: {
  title: string;
  data: Array<{ time: string; value: number }>;
  color: string;
}) => (
  <div className="rounded-3xl bg-white p-6 shadow-soft">
    <p className="text-sm text-gray-500">{title}</p>
    <div className="mt-4 h-64 w-full" style={{ minHeight: '256px', minWidth: '0' }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={0}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }} 
            interval="preserveStartEnd"
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default PersonnelDetailsPage;

