import clsx from "clsx";

type LogoMarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses: Record<Required<LogoMarkProps>["size"], string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
};

const LogoMark = ({ size = "md", className }: LogoMarkProps) => (
  <div
    className={clsx(
      "flex items-center justify-center rounded-full bg-gradient-to-br from-brand-dark to-brand-light font-semibold uppercase tracking-wide text-white shadow-soft",
      sizeClasses[size],
      className
    )}
  >
    SV
  </div>
);

export default LogoMark;



