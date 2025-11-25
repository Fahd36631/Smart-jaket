import clsx from "clsx";
import { statusColor, statusLabel } from "../../lib/utils";
import type { SensorReading } from "../../types/personnel";

const SensorCard = ({ reading }: { reading: SensorReading }) => {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{reading.label}</p>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            statusColor[reading.state]
          )}
        >
          {statusLabel[reading.state]}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gray-900">{reading.value}</span>
        <span className="text-sm text-gray-400">{reading.unit}</span>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        آخر تحديث:{" "}
        {new Intl.DateTimeFormat("ar-SA", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }).format(new Date(reading.lastUpdated))}
      </p>
    </div>
  );
};

export default SensorCard;

