import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "warning" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
  danger: "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm hover:shadow",
  success: "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-sm hover:shadow",
  warning: "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 shadow-sm hover:shadow",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200",
  outline: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && icon}
      {children}
    </button>
  );
}
