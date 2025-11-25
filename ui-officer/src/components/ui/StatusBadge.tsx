import clsx from "clsx";
import { statusColor, statusLabel } from "../../lib/utils";
import type { SensorState } from "../../types/personnel";

type Props = {
  state: SensorState;
};

const StatusBadge = ({ state }: Props) => {
  return (
    <span
      className={clsx(
        "inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1 text-sm font-semibold",
        statusColor[state]
      )}
    >
      {statusLabel[state]}
    </span>
  );
};

export default StatusBadge;

