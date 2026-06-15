import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  type?: "default" | "success" | "warning" | "danger" | "primary";
  icon?: ReactNode;
  content?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const typeColors = {
  default: "bg-slate-400",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  primary: "bg-primary-500",
};

const typeBorderColors = {
  default: "border-slate-200",
  success: "border-success-200",
  warning: "border-warning-200",
  danger: "border-danger-200",
  primary: "border-primary-200",
};

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        暂无记录
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const type = item.type || "default";

        return (
          <div key={item.id} className="relative pl-8 pb-5 last:pb-0">
            {/* 时间线 */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-2.5 top-6 bottom-0 w-px",
                  typeBorderColors[type]
                )}
              />
            )}

            {/* 时间点 */}
            <div
              className={cn(
                "absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center",
                typeColors[type],
                "shadow-sm"
              )}
            >
              {item.icon && <span className="text-white">{item.icon}</span>}
            </div>

            {/* 内容 */}
            <div className="bg-transparent">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-slate-800">{item.title}</h4>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
              {item.description && (
                <p className="text-sm text-slate-500 mb-2">{item.description}</p>
              )}
              {item.content && <div className="mt-1">{item.content}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
