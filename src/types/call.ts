export type CallStatus = "connected" | "no_answer" | "busy" | "disconnected" | "wrong_number";

export type CallResult = "confirmed" | "pending" | "escalated" | "failed" | "other";

export interface CallLog {
  id: string;
  taskId: string;
  patientId: string;
  caller: string;
  callerName: string;
  callTime: string;
  duration: number;
  status: CallStatus;
  result: CallResult;
  note: string;
  familyJoined: boolean;
  familyName?: string;
  familyRelation?: string;
  recordUrl?: string;
  nextFollowUpTime?: string;
}

export const callStatusMap: Record<CallStatus, { label: string; color: string; bgColor: string }> = {
  connected: {
    label: "已接通",
    color: "text-success-600",
    bgColor: "bg-success-50",
  },
  no_answer: {
    label: "未接听",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
  },
  busy: {
    label: "占线",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
  },
  disconnected: {
    label: "已挂断",
    color: "text-danger-600",
    bgColor: "bg-danger-50",
  },
  wrong_number: {
    label: "号码错误",
    color: "text-danger-600",
    bgColor: "bg-danger-50",
  },
};

export const callResultMap: Record<CallResult, { label: string; color: string }> = {
  confirmed: {
    label: "已确认",
    color: "text-success-600",
  },
  pending: {
    label: "待跟进",
    color: "text-warning-600",
  },
  escalated: {
    label: "已升级",
    color: "text-danger-600",
  },
  failed: {
    label: "失败",
    color: "text-danger-600",
  },
  other: {
    label: "其他",
    color: "text-slate-600",
  },
};
