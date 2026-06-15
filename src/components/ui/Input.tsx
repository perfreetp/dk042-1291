import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Input({
  label,
  error,
  icon,
  iconPosition = "left",
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full h-10 px-3 text-sm border rounded-lg",
            "bg-white text-slate-800 placeholder-slate-400",
            "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
            "transition-all duration-200 outline-none",
            "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            className
          )}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg resize-y",
          "bg-white text-slate-800 placeholder-slate-400",
          "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          "transition-all duration-200 outline-none",
          "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
          error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full h-10 px-3 text-sm border rounded-lg appearance-none cursor-pointer",
          "bg-white text-slate-800",
          "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          "transition-all duration-200 outline-none",
          "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
          error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
