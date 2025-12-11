import { MapPinIcon } from "@heroicons/react/24/solid";
import StatusBadge from "../components/ui/StatusBadge";
import { useSensorReadings } from "../hooks/useSensorReadings";
import { usePersonnel } from "../hooks/usePersonnel";
import { mapReadingsToPersonnel } from "../lib/firebaseUtils";

const MapViewPage = () => {
  const { readings, loading: readingsLoading } = useSensorReadings(undefined, 100);
  const { personnel: personnelList, loading: personnelLoading } = usePersonnel();
  const personnel = mapReadingsToPersonnel(readings, personnelList);
  
  const loading = readingsLoading || personnelLoading;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-brand-dark" />
          <span className="mt-4 block text-gray-600">جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">الخريطة الميدانية</p>
          <h2 className="text-2xl font-bold text-brand-dark">مواقع الأفراد</h2>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm text-gray-500 shadow-soft">
          يتم التحديث كل 15 ثانية
        </span>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex h-96 items-center justify-center rounded-2xl bg-gray-100">
          <div className="text-center">
            <MapPinIcon className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              الموقع غير متوفر حالياً
            </p>
            <p className="mt-2 text-sm text-gray-500">
              بيانات الموقع ستظهر هنا عند توفرها من الأجهزة
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          سيتم دمج واجهة الخرائط الحقيقية (Mapbox / Leaflet) عند توفر بيانات الموقع من ESP32.
        </p>
      </div>

      {personnel.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
          <p className="text-lg font-semibold text-gray-700">
            لا توجد بيانات متاحة
          </p>
          <p className="mt-2 text-sm text-gray-500">
            تأكد من أن الأفراد مضافون وأن البيانات تُرسل من الأجهزة.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {personnel.map((person) => (
            <div
              key={person.id}
              className="rounded-2xl border border-surface-card bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{person.name}</p>
                  <p className="text-sm text-gray-500">{person.unit}</p>
                </div>
                <StatusBadge state={person.status} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <span>الموقع غير متوفر</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Device ID: {personnelList.find(p => (p.personnel_id || p.id) === person.id)?.device_id || "غير محدد"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapViewPage;


