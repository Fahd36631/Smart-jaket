import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import { personnelMock } from "../data/mock";
import type { PersonnelRecord, SensorState } from "../types/personnel";

const PersonnelListPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SensorState | "all">("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const filteredPersonnel = useMemo(() => {
    return personnelMock.filter((person) => {
      const matchesSearch =
        person.name.includes(search) || person.id.includes(search);
      const matchesStatus =
        statusFilter === "all" ? true : person.status === statusFilter;
      const matchesUnit =
        unitFilter === "all" ? true : person.unit === unitFilter;
      return matchesSearch && matchesStatus && matchesUnit;
    });
  }, [search, statusFilter, unitFilter]);

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
          {[...new Set(personnelMock.map((p) => p.unit))].map((unit) => (
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
    id: "",
    rank: "",
    unit: "",
    phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("تم حفظ بيانات الفرد وإرسالها لـ API (محاكاة)");
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1500);
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
              value={form[field.name as keyof typeof form]}
              onChange={(e) => handleChange(field.name as keyof typeof form, e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40"
            />
          </label>
        ))}
      </div>
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
          className="rounded-2xl bg-brand-dark px-5 py-2 text-sm font-semibold text-white"
        >
          حفظ وإرسال
        </button>
      </div>
    </form>
  );
};

const formFields: Array<{
  name: keyof PersonnelRecord | "phone";
  label: string;
  required?: boolean;
  type?: string;
}> = [
  { name: "name", label: "الاسم الكامل", required: true },
  { name: "id", label: "الرقم العسكري", required: true },
  { name: "rank", label: "الرتبة", required: true },
  { name: "unit", label: "الوحدة / الفرع", required: true },
  { name: "phone", label: "رقم الجوال", type: "tel" },
];

export default PersonnelListPage;

