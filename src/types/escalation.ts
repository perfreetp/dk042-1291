export type EscalationLevel = "level1" | "level2" | "level3";

export type EscalationStatus = "pending" | "processing" | "resolved" | "closed";

export interface EscalationRecord {
  id: string;
  taskId: string;
  patientId: string;
  level: EscalationLevel;
  reason: string;
  reporter: string;
  reporterName: string;
  handler?: string;
  handlerName?: string;
  status: EscalationStatus;
  createTime: string;
  handleTime?: string;
  resolveTime?: string;
  result?: string;
  description?: string;
  emergencyCode?: string;
  isNightShift?: boolean;
}

export const escalationLevelMap: Record<EscalationLevel, { label: string; color: string; bgColor: string; level: number }> = {
  level1: {
    label: "一级（值班医生）",
    color: "text-warning-600",
    bgColor: "bg-warning-50 border-warning-300",
    level: 1,
  },
  level2: {
    label: "二级（科室主任）",
    color: "text-danger-600",
    bgColor: "bg-danger-50 border-danger-300",
    level: 2,
  },
  level3: {
    label: "三级（医务科）",
    color: "text-danger-700",
    bgColor: "bg-danger-100 border-danger-400",
    level: 3,
  },
};

export const escalationStatusMap: Record<EscalationStatus, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: "待处理",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
  },
  processing: {
    label: "处理中",
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  resolved: {
    label: "已解决",
    color: "text-success-600",
    bgColor: "bg-success-50",
  },
  closed: {
    label: "已关闭",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
};
