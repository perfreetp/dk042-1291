export type RiskLevel = "high" | "medium" | "low";

export type HighRiskType =
  | "妊娠期高血压"
  | "妊娠期糖尿病"
  | "前置胎盘"
  | "胎盘早剥"
  | "羊水过多"
  | "羊水过少"
  | "胎儿生长受限"
  | "巨大儿"
  | "多胎妊娠"
  | "高龄产妇"
  | "瘢痕子宫"
  | "其他";

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  gestationalWeek: number;
  gestationalDay: number;
  riskLevel: RiskLevel;
  highRiskType: HighRiskType[];
  expectedDate: string;
  address: string;
  familyContact: string;
  familyPhone: string;
  createTime: string;
  lastVisitTime: string;
  nextVisitTime: string;
  abnormalIndicators?: string[];
  isLostFollow?: boolean;
  note?: string;
}

export const riskLevelMap: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  high: { label: "高危", color: "text-danger-600", bgColor: "bg-danger-50 border-danger-200" },
  medium: { label: "中危", color: "text-warning-600", bgColor: "bg-warning-50 border-warning-200" },
  low: { label: "低危", color: "text-success-600", bgColor: "bg-success-50 border-success-200" },
};
