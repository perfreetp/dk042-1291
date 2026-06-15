import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TagVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
type TagSize = "sm" | "md";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  closable?: boolean;
  onClose?: () => void;
}

const variantStyles: Record<TagVariant, string> = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-primary-50 text-primary-600 border border-primary-200",
  success: "bg-success-50 text-success-600 border border-success-200",
  warning: "bg-warning-50 text-warning-600 border border-warning-200",
  danger: "bg-danger-50 text-danger-600 border border-danger-200",
  info: "bg-slate-50 text-slate-600 border border-slate-200",
};

const sizeStyles: Record<TagSize, string> = {
  sm: "h-5 px-2 text-xs",
  md: "h-6 px-2.5 text-sm",
};

export function Tag({
  children,
  variant = "default",
  size = "sm",
  closable = false,
  onClose,
  className,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
      {closable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
