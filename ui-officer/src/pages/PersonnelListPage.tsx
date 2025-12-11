import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import { useSensorReadings } from "../hooks/useSensorReadings";
import { usePersonnel, addPersonnel } from "../hooks/usePersonnel";
import { mapReadingsToPersonnel } from "../lib/firebaseUtils";
import type { PersonnelRecord, SensorState } from "../types/personnel";

const PersonnelListPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SensorState | "all">("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const { readings, loading: readingsLoading, error: readingsError } = useSensorReadings(undefined, 100);
  const { personnel: personnelList, loading: personnelLoading } = usePersonnel();
  const personnel = mapReadingsToPersonnel(readings, personnelList);
  
  const loading = readingsLoading || personnelLoading;
  const error = readingsError;

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      const matchesSearch =
        person.name.includes(search) || person.id.includes(search);
      const matchesStatus =
        statusFilter === "all" ? true : person.status === statusFilter;
      const matchesUnit =
        unitFilter === "all" ? true : person.unit === unitFilter;
      return matchesSearch && matchesStatus && matchesUnit;
    });
  }, [personnel, search, statusFilter, unitFilter]);

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

  const uniqueUnits = [...new Set(personnel.map((p) => p.unit))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">إدارة الأفراد</p>
          <h2 className="text-2xl font-bold text-brand-dark">
            قائمة الأفراد المتصلين
          </h2>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-2xl bg-brand-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-dark/30"
        >
          {showForm ? "إغلاق النموذج" : "إضافة فرد جديد"}
        </button>
      </div>

      {showForm && <AddPersonnelForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
          placeholder="ابحث بالاسم أو الرقم"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SensorState | "all")}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
        >
          <option value="all">كل الحالات</option>
          <option value="normal">طبيعي</option>
          <option value="warning">تنبيه</option>
          <option value="danger">خطر</option>
        </select>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
        >
          <option value="all">كل الوحدات</option>
          {uniqueUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4 md:hidden">
        {filteredPersonnel.map((person) => (
          <div
            key={person.id}
            className="rounded-2xl border border-surface-card bg-white p-4 shadow-sm"
            onClick={() => navigate(`/personnel/${person.id}`)}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-gray-900">{person.name}</p>
                <p className="text-sm text-gray-500">{person.rank}</p>
              </div>
              <StatusBadge state={person.status} />
            </div>
            <p className="mt-3 text-sm text-gray-500">{person.unit}</p>
            <p className="text-xs text-gray-400">
              آخر تحديث:{" "}
              {new Intl.DateTimeFormat("ar-SA", {
                hour: "numeric",
                minute: "numeric",
              }).format(new Date(person.lastReadingAt))}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-soft md:block">
        <table className="min-w-full text-right">
          <thead className="text-sm text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">الفرد</th>
              <th className="px-6 py-4 font-medium">الرتبة</th>
              <th className="px-6 py-4 font-medium">الوحدة</th>
              <th className="px-6 py-4 font-medium">آخر تحديث</th>
              <th className="px-6 py-4 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredPersonnel.map((person) => (
              <tr
                key={person.id}
                className="cursor-pointer border-t transition hover:bg-surface-muted"
                onClick={() => navigate(`/personnel/${person.id}`)}
              >
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {person.name}
                </td>
                <td className="px-6 py-4">{person.rank}</td>
                <td className="px-6 py-4">{person.unit}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Intl.DateTimeFormat("ar-SA", {
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date(person.lastReadingAt))}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge state={person.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPersonnel.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-500">
            لا توجد نتائج مطابقة لخيارات البحث الحالية.
          </p>
        )}
      </div>
    </div>
  );
};

const AddPersonnelForm = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({
    name: "",
    personnel_id: "",
    rank: "",
    unit: "",
    phone: "",
    device_id: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!form.name || !form.rank || !form.unit || !form.device_id) {
        throw new Error("يرجى ملء جميع الحقول المطلوبة");
      }

      await addPersonnel({
        name: form.name,
        rank: form.rank,
        unit: form.unit,
        phone: form.phone || undefined,
        device_id: form.device_id,
        personnel_id: form.personnel_id || undefined,
      });

      setMessage("✅ تم إضافة الفرد بنجاح!");
      setTimeout(() => {
        setMessage(null);
        onClose();
        setForm({
          name: "",
          personnel_id: "",
          rank: "",
          unit: "",
          phone: "",
          device_id: "",
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إضافة الفرد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-6 shadow-soft"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {formFields.map((field) => (
          <label key={field.name} className="text-sm text-gray-500">
            {field.label}
            <input
              required={field.required}
              type={field.type ?? "text"}
              value={form[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
            />
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-2xl bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-2xl bg-status-safe/10 px-4 py-3 text-sm text-status-safe">
          {message}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-gray-200 px-4 py-2 text-sm"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-brand-dark px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "جاري الحفظ..." : "حفظ وإرسال"}
        </button>
      </div>
    </form>
  );
};

type FormField = {
  name: "name" | "personnel_id" | "rank" | "unit" | "phone" | "device_id";
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
};

const formFields: FormField[] = [
  { name: "name", label: "الاسم الكامل", required: true, placeholder: "مثال: خالد العتيبي" },
  { name: "personnel_id", label: "الرقم العسكري", required: false, placeholder: "مثال: P-2031 (اختياري)" },
  { name: "rank", label: "الرتبة", required: true, placeholder: "مثال: رقيب" },
  { name: "unit", label: "الوحدة / الفرع", required: true, placeholder: "مثال: مركز شمال الرياض" },
  { name: "device_id", label: "معرف الجهاز (Device ID)", required: true, placeholder: "مثال: ESP32-001" },
  { name: "phone", label: "رقم الجوال", type: "tel", placeholder: "مثال: 0551234567" },
];

export default PersonnelListPage;

