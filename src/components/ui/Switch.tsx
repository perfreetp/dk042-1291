import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const sizeStyles = {
  sm: {
    track: "w-8 h-4",
    thumb: "w-3 h-3",
    translate: "translate-x-4",
  },
  md: {
    track: "w-11 h-6",
    thumb: "w-5 h-5",
    translate: "translate-x-6",
  },
};

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  className,
}: SwitchProps) {
  const sizes = sizeStyles[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        checked ? "bg-primary-500" : "bg-slate-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        sizes.track,
        className
      )}
      disabled={disabled}
    >
      <span
        className={cn(
          "inline-block bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out",
          sizes.thumb,
          checked ? sizes.translate : "translate-x-0.5"
        )}
      />
    </button>
  );
}
