import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerPlacement = "right" | "left" | "top" | "bottom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  placement?: DrawerPlacement;
  width?: string;
  height?: string;
  className?: string;
  maskClosable?: boolean;
}

const placementStyles: Record<DrawerPlacement, string> = {
  right: "top-0 right-0 h-full animate-slide-right",
  left: "top-0 left-0 h-full",
  top: "top-0 left-0 w-full",
  bottom: "bottom-0 left-0 w-full",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  placement = "right",
  width = "400px",
  height = "400px",
  className,
  maskClosable = true,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isHorizontal = placement === "right" || placement === "left";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => maskClosable && onClose()}
      />
      <div
        className={cn(
          "absolute bg-white shadow-xl flex flex-col z-10",
          placementStyles[placement],
          className
        )}
        style={{
          width: isHorizontal ? width : "100%",
          height: !isHorizontal ? height : "100%",
        }}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
