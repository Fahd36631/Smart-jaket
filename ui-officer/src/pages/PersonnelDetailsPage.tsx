import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import SensorCard from "../components/ui/SensorCard";
import StatusBadge from "../components/ui/StatusBadge";
import { personnelMock } from "../data/mock";
import { formatDateTime } from "../lib/utils";

const PersonnelDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const person = personnelMock.find((p) => p.id === id);

  const heartHistory = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, index) => ({
        time: `${10 - index}:0${(index * 3) % 6} صباحاً`,
        value:
          (person?.sensors.heartRate.value ?? 110) +
          Math.round(Math.sin(index) * 6),
      })),
    [person]
  );

  const tempHistory = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, index) => ({
        time: `${10 - index}:0${(index * 2) % 6} صباحاً`,
        value:
          (person?.sensors.temperature.value ?? 37.2) +
          Math.round(Math.sin(index) * 2) / 2,
      })),
    [person]
  );

  if (!person) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
        <p className="text-lg font-semibold text-gray-700">
          تعذر العثور على بيانات الفرد.
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
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default PersonnelDetailsPage;

