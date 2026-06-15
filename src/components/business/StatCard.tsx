import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardVariant = "default" | "primary" | "success" | "warning" | "danger";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: StatCardVariant;
  onClick?: () => void;
  footer?: ReactNode;
  className?: string;
}

const variantStyles: Record<StatCardVariant, { bg: string; iconBg: string; iconColor: string; textColor: string }> = {
  default: {
    bg: "bg-white",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    textColor: "text-slate-800",
  },
  primary: {
    bg: "bg-gradient-to-br from-primary-50 to-blue-50",
    iconBg: "bg-primary-500",
    iconColor: "text-white",
    textColor: "text-primary-700",
  },
  success: {
    bg: "bg-gradient-to-br from-success-50 to-emerald-50",
    iconBg: "bg-success-500",
    iconColor: "text-white",
    textColor: "text-success-700",
  },
  warning: {
    bg: "bg-gradient-to-br from-warning-50 to-amber-50",
    iconBg: "bg-warning-500",
    iconColor: "text-white",
    textColor: "text-warning-700",
  },
  danger: {
    bg: "bg-gradient-to-br from-danger-50 to-rose-50",
    iconBg: "bg-danger-500",
    iconColor: "text-white",
    textColor: "text-danger-700",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = "default",
  onClick,
  footer,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-success-600"
      : trend === "down"
      ? "text-danger-600"
      : "text-slate-400";

  return (
    <div
      className={cn(
        "rounded-xl p-5 shadow-card border border-slate-100 transition-all duration-200",
        styles.bg,
        onClick && "hover:shadow-card-hover cursor-pointer hover:-translate-y-0.5",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className={cn("text-3xl font-bold", styles.textColor)}>{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              styles.iconBg,
              styles.iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 text-sm">
          {trend && (
            <span className={cn("flex items-center gap-1", trendColor)}>
              <TrendIcon size={14} />
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}

      {footer && <div className="mt-4 pt-3 border-t border-slate-100/50">{footer}</div>}
    </div>
  );
}
