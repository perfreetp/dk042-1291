import type { TaskType, TaskPriority } from "./task";

export type ReminderRuleType = "prenatal" | "abnormal" | "followup" | "revisit" | "custom";

export interface ReminderRule {
  id: string;
  ruleName: string;
  ruleType: ReminderRuleType;
  taskType: TaskType;
  triggerCondition: string;
  advanceDays: number;
  enabled: boolean;
  smsTemplate: string;
  callScript: string;
  priority: TaskPriority;
  retryInterval: number;
  maxRetryCount: number;
  createTime: string;
  updateTime: string;
  description?: string;
}

export interface AbnormalThreshold {
  id: string;
  indicatorName: string;
  indicatorCode: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  warningMin: number;
  warningMax: number;
  criticalMin: number;
  criticalMax: number;
  enabled: boolean;
  priority: TaskPriority;
  description?: string;
}

export const reminderRuleTypeMap: Record<ReminderRuleType, { label: string; color: string; icon: string }> = {
  prenatal: {
    label: "产检提醒",
    color: "text-primary-600",
    icon: "Calendar",
  },
  abnormal: {
    label: "异常指标",
    color: "text-danger-600",
    icon: "AlertTriangle",
  },
  followup: {
    label: "随访回访",
    color: "text-success-600",
    icon: "Phone",
  },
  revisit: {
    label: "复诊催办",
    color: "text-warning-600",
    icon: "Clock",
  },
  custom: {
    label: "自定义",
    color: "text-slate-600",
    icon: "Settings",
  },
};
