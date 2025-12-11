import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import AlertList from "../components/dashboard/AlertList";
import MetricCard from "../components/ui/MetricCard";
import StatusBadge from "../components/ui/StatusBadge";
import { useSensorReadings } from "../hooks/useSensorReadings";
import { usePersonnel } from "../hooks/usePersonnel";
import { mapReadingsToPersonnel } from "../lib/firebaseUtils";

const DashboardPage = () => {
  const { readings, loading: readingsLoading, error: readingsError } = useSensorReadings(undefined, 100);
  const { personnel: personnelList, loading: personnelLoading } = usePersonnel();
  const personnel = mapReadingsToPersonnel(readings, personnelList);
  
  const loading = readingsLoading || personnelLoading;
  const error = readingsError;

  const total = personnel.length;
  const safe = personnel.filter((p) => p.status === "normal").length;
  const warning = personnel.filter((p) => p.status === "warning").length;
  const danger = personnel.filter((p) => p.status === "danger").length;

  const chartData = [
    { name: "طبيعي", value: safe, color: "#009b6d" },
    { name: "تنبيه", value: warning, color: "#f2b90c" },
    { name: "خطر", value: danger, color: "#d82727" },
  ];

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

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-3xl bg-white p-6 shadow-soft text-center">
          <p className="text-lg font-semibold text-red-600">خطأ في تحميل البيانات</p>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (personnel.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-3xl bg-white p-6 shadow-soft text-center">
          <p className="text-lg font-semibold text-gray-700">لا توجد بيانات متاحة</p>
          <p className="mt-2 text-sm text-gray-500">
            تأكد من إرسال البيانات من ESP32 إلى Backend API
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="إجمالي الأفراد"
          value={total}
          accent="brand"
          description="نشط حالياً"
        />
        <MetricCard
          label="حالة طبيعية"
          value={safe}
          accent="safe"
          description="جاهز"
        />
        <MetricCard
          label="حالات تنبيه"
          value={warning}
          accent="warn"
          description="تحتاج متابعة"
        />
        <MetricCard
          label="حالات خطرة"
          value={danger}
          accent="danger"
          description="أولوية قصوى"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">مراقبة الأفراد</p>
              <h3 className="text-xl font-bold text-gray-900">
                الحالات الحالية في الميدان
              </h3>
            </div>
            <span className="text-sm text-gray-400">
              {readings.length > 0
                ? `آخر تحديث: ${new Intl.DateTimeFormat("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(readings[0].created_at instanceof Date ? readings[0].created_at : new Date()))}`
                : "لا توجد تحديثات"}
            </span>
          </div>
          <div className="mt-6 space-y-4 lg:hidden">
            {personnel.map((person) => (
              <div
                key={person.id}
                className="rounded-2xl border border-surface-card bg-surface-muted/60 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {person.name}
                    </p>
                    <p className="text-sm text-gray-500">{person.unit}</p>
                  </div>
                  <StatusBadge state={person.status} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  آخر قراءة{" "}
                  {new Intl.DateTimeFormat("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(person.lastReadingAt))}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="min-w-full text-right">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="pb-3 font-medium">الفرد</th>
                  <th className="pb-3 font-medium">الوحدة</th>
                  <th className="pb-3 font-medium">آخر قراءة</th>
                  <th className="pb-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {personnel.map((person) => (
                  <tr key={person.id} className="border-t">
                    <td className="py-3 font-semibold text-gray-900">
                      {person.name}
                    </td>
                    <td className="py-3">{person.unit}</td>
                    <td className="py-3">
                      {new Intl.DateTimeFormat("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(person.lastReadingAt))}
                    </td>
                    <td className="py-3">
                      <StatusBadge state={person.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm text-gray-500">توزيع الحالات</p>
          <h3 className="text-xl font-bold text-gray-900">نظرة سريعة</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}: {entry.value} أفراد
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AlertList />
        <div className="rounded-3xl bg-white p-6 shadow-soft lg:col-span-2">
          <p className="text-sm text-gray-500">الخريطة التفاعلية</p>
          <h3 className="text-xl font-bold text-gray-900">مواقع الأفراد</h3>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-light p-6 text-white">
            <p className="text-lg font-semibold">مستوى جاهزية عالي</p>
            <p className="mt-2 text-sm text-white/70">
              جميع الأفراد متصلون، يتم تحديث المواقع كل 15 ثانية.
            </p>
            <div className="mt-6 h-48 rounded-xl bg-[url('https://tile.openstreetmap.org/8/141/96.png')] bg-cover bg-center opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

