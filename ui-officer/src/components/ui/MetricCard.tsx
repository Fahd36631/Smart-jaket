type MetricCardProps = {
  label: string;
  value: string | number;
  accent?: "safe" | "warn" | "danger" | "brand";
  description?: string;
};

const accentMap: Record<Required<MetricCardProps>["accent"], string> = {
  brand: "bg-brand-dark/10 text-brand-dark",
  safe: "bg-status-safe/10 text-status-safe",
  warn: "bg-status-warn/15 text-status-warn",
  danger: "bg-status-danger/10 text-status-danger",
};

const MetricCard = ({
  label,
  value,
  accent = "brand",
  description,
}: MetricCardProps) => (
  <div className="rounded-3xl bg-white p-6 shadow-soft">
    <p className="text-sm text-gray-500">{label}</p>
    <div className="mt-3 flex items-baseline gap-3">
      <span className="text-4xl font-bold">{value}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${accentMap[accent]}`}
      >
        {description}
      </span>
    </div>
  </div>
);

export default MetricCard;

