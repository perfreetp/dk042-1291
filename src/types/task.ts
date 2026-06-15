import type { Patient } from "./patient";

export type TaskType =
  | "prenatal_check"
  | "abnormal_index"
  | "follow_up"
  | "revisit_miss"
  | "lost_contact"
  | "emergency";

export type TaskStatus = "pending" | "processing" | "completed" | "escalated" | "failed";

export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface Task {
  id: string;
  patientId: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  triggerTime: string;
  deadline: string;
  retryCount: number;
  maxRetryCount: number;
  assignedTo: string;
  assignedName: string;
  description: string;
  createTime: string;
  updateTime: string;
  relatedIndex?: string;
  relatedValue?: string;
  relatedNormalRange?: string;
  smsSent?: boolean;
  smsSendTime?: string;
  patient?: Patient;
}

export const taskTypeMap: Record<TaskType, { label: string; color: string; bgColor: string; icon: string }> = {
  prenatal_check: {
    label: "产检提醒",
    color: "text-primary-600",
    bgColor: "bg-primary-50 border-primary-200",
    icon: "Calendar",
  },
  abnormal_index: {
    label: "异常指标",
    color: "text-danger-600",
    bgColor: "bg-danger-50 border-danger-200",
    icon: "AlertTriangle",
  },
  follow_up: {
    label: "随访回访",
    color: "text-success-600",
    bgColor: "bg-success-50 border-success-200",
    icon: "Phone",
  },
  revisit_miss: {
    label: "复诊未到",
    color: "text-warning-600",
    bgColor: "bg-warning-50 border-warning-200",
    icon: "Clock",
  },
  lost_contact: {
    label: "失联补联",
    color: "text-warning-600",
    bgColor: "bg-warning-50 border-warning-200",
    icon: "UserX",
  },
  emergency: {
    label: "紧急上报",
    color: "text-danger-600",
    bgColor: "bg-danger-50 border-danger-200",
    icon: "Siren",
  },
};

export const taskStatusMap: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: "待处理",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  processing: {
    label: "处理中",
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  completed: {
    label: "已完成",
    color: "text-success-600",
    bgColor: "bg-success-50",
  },
  escalated: {
    label: "已升级",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
  },
  failed: {
    label: "失败",
    color: "text-danger-600",
    bgColor: "bg-danger-50",
  },
};

export const taskPriorityMap: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  urgent: {
    label: "紧急",
    color: "text-danger-600",
    bgColor: "bg-danger-50 border-danger-300",
  },
  high: {
    label: "高",
    color: "text-warning-600",
    bgColor: "bg-warning-50 border-warning-300",
  },
  medium: {
    label: "中",
    color: "text-primary-600",
    bgColor: "bg-primary-50 border-primary-300",
  },
  low: {
    label: "低",
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-300",
  },
};
