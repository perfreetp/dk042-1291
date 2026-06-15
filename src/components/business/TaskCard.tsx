import { Phone, Clock, AlertCircle, Calendar, AlertTriangle, UserX, Siren } from "lucide-react";
import type { Task } from "@/types/task";
import { taskTypeMap, taskStatusMap, taskPriorityMap } from "@/types/task";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { getRemainingTime, formatDateTime, formatRelativeTime } from "@/utils/date";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onCall?: () => void;
  compact?: boolean;
}

const iconMap = {
  Calendar,
  AlertTriangle,
  Phone,
  Clock,
  UserX,
  Siren,
};

export function TaskCard({ task, onClick, onCall, compact = false }: TaskCardProps) {
  const typeInfo = taskTypeMap[task.taskType];
  const statusInfo = taskStatusMap[task.status];
  const priorityInfo = taskPriorityMap[task.priority];
  const remaining = getRemainingTime(task.deadline);
  const TaskIcon = iconMap[typeInfo.icon as keyof typeof iconMap] || Phone;

  const isUrgent = task.priority === "urgent" || remaining.isOverdue;

  if (compact) {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md",
          isUrgent ? "border-danger-200 bg-danger-50/50" : "bg-white border-slate-100 hover:border-primary-200"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              typeInfo.bgColor
            )}
          >
            <TaskIcon size={18} className={typeInfo.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800 truncate">
                {task.patient?.name || "未知患者"}
              </span>
              <Badge variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"} dot>
                {priorityInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className={cn(
                "text-xs font-medium",
                remaining.isOverdue ? "text-danger-600" : "text-slate-500"
              )}
            >
              {remaining.text}
            </p>
            {task.smsSent && (
              <span className="text-xs text-slate-400">短信已发送</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-card-hover",
        isUrgent
          ? "border-danger-200 bg-white shadow-danger-50"
          : "bg-white border-slate-100 hover:border-primary-200"
      )}
      onClick={onClick}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              typeInfo.bgColor
            )}
          >
            <TaskIcon size={22} className={typeInfo.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">
                {task.patient?.name || "未知患者"}
              </h3>
              <Tag variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "primary"} size="sm">
                {priorityInfo.label}优先级
              </Tag>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{typeInfo.label} · {task.id}</p>
          </div>
        </div>
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusInfo.bgColor, statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>

      {/* 描述 */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{task.description}</p>

      {/* 异常指标信息 */}
      {task.relatedIndex && (
        <div className="mb-4 p-3 bg-danger-50 rounded-lg">
          <div className="flex items-center gap-2 text-danger-700">
            <AlertCircle size={14} />
            <span className="text-sm font-medium">{task.relatedIndex}</span>
          </div>
          <p className="text-xs text-danger-600 mt-1">
            当前值: <span className="font-medium">{task.relatedValue}</span>
            {task.relatedNormalRange && ` · 正常范围: ${task.relatedNormalRange}`}
          </p>
        </div>
      )}

      {/* 患者信息 */}
      {task.patient && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={14} className="text-slate-400" />
            <span>{task.patient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span>孕{task.patient.gestationalWeek}周{task.patient.gestationalDay}天</span>
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>触发时间: {formatRelativeTime(task.triggerTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>重试: {task.retryCount}/{task.maxRetryCount}次</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              remaining.isOverdue ? "text-danger-600" : "text-slate-500"
            )}
          >
            {remaining.text}
          </span>
          {task.status === "pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCall?.();
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              立即回访
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
