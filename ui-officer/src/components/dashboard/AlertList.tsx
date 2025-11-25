import {
  BellAlertIcon,
  HeartIcon,
  SignalSlashIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { recentAlerts } from "../../data/mock";
import { formatTime, statusColor } from "../../lib/utils";

const iconMap = {
  temperature: SunIcon,
  "heart-rate": HeartIcon,
  gas: BellAlertIcon,
  signal: SignalSlashIcon,
};

const AlertList = () => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">آخر التنبيهات</p>
          <h3 className="text-xl font-bold text-gray-900">الحالات الحرجة</h3>
        </div>
        <span className="rounded-full bg-brand-dark/10 px-4 py-1 text-sm font-semibold text-brand-dark">
          {recentAlerts.length} تنبيه
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {recentAlerts.map((alert) => {
          const Icon = iconMap[alert.type];
          const severity = alert.severity === "danger" ? "danger" : "warning";
          return (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-2xl border border-surface-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "rounded-full p-2",
                    severity === "danger"
                      ? "bg-status-danger/10 text-status-danger"
                      : "bg-status-warn/10 text-status-warn"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{alert.personName}</p>
                  <p className="text-sm text-gray-500">{alert.description}</p>
                </div>
              </div>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  severity === "danger"
                    ? statusColor.danger
                    : statusColor.warning
                )}
              >
                {formatTime(alert.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertList;

