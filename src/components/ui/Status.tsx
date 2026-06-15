import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

type AlertType = "info" | "success" | "warning" | "error";

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

const typeStyles: Record<AlertType, { bg: string; border: string; text: string; icon: ReactNode }> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: <Info size={20} />,
  },
  success: {
    bg: "bg-success-50",
    border: "border-success-200",
    text: "text-success-700",
    icon: <CheckCircle2 size={20} />,
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    text: "text-warning-700",
    icon: <AlertTriangle size={20} />,
  },
  error: {
    bg: "bg-danger-50",
    border: "border-danger-200",
    text: "text-danger-700",
    icon: <AlertCircle size={20} />,
  },
};

export function Alert({
  type = "info",
  title,
  children,
  className,
  showIcon = true,
}: AlertProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 flex items-start gap-3",
        styles.bg,
        styles.border,
        styles.text,
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0 mt-0.5">{styles.icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
}

const colorMap = {
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
};

export function Progress({
  value,
  max = 100,
  label,
  showLabel = false,
  color = "primary",
  size = "md",
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-slate-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorMap[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      {icon && <div className="text-slate-300 mb-4">{icon}</div>}
      <p className="text-base font-medium text-slate-600 mb-1">{title}</p>
      {description && <p className="text-sm text-slate-400 text-center mb-4">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "dot";
  dot?: boolean;
  className?: string;
}

const badgeVariants = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-primary-100 text-primary-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-danger-100 text-danger-700",
  dot: "bg-transparent text-slate-600",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        badgeVariants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-success-500",
            variant === "warning" && "bg-warning-500",
            variant === "danger" && "bg-danger-500",
            variant === "primary" && "bg-primary-500",
            variant === "default" && "bg-slate-500"
          )}
        />
      )}
      {children}
    </span>
  );
}
