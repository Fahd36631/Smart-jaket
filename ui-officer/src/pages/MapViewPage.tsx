import { MapPinIcon } from "@heroicons/react/24/solid";
import StatusBadge from "../components/ui/StatusBadge";
import { personnelMock } from "../data/mock";

const MapViewPage = () => {
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

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="h-96 rounded-2xl bg-[url('https://tile.openstreetmap.org/6/43/27.png')] bg-cover bg-center" />
        <p className="mt-3 text-sm text-gray-500">
          سيتم دمج واجهة الخرائط الحقيقية (Mapbox / Leaflet) عبر بيانات الـ API
          حال توفرها. الخريطة الحالية مجرد معاينة تصميمية.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {personnelMock.map((person) => (
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
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 text-brand-dark" />
              {person.location.city}
            </div>
            <p className="mt-2 text-sm text-gray-400">
              (Lat: {person.location.lat.toFixed(4)}, Lng:{" "}
              {person.location.lng.toFixed(4)})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapViewPage;

