import type { EscalationRecord } from "@/types/escalation";

export const mockEscalationRecords: EscalationRecord[] = [
  {
    id: "E001",
    taskId: "T012",
    patientId: "P007",
    level: "level1",
    reason: "羊水过多患者自述腹痛加重，伴有阴道流水症状",
    reporter: "U002",
    reporterName: "王护士",
    handler: "D001",
    handlerName: "陈医生",
    status: "processing",
    createTime: "2026-06-16 15:50:00",
    handleTime: "2026-06-16 15:55:00",
    emergencyCode: "EMG-2026-001",
    isNightShift: false,
    description: "患者孕30周+6天，羊水过多，今日自诉腹痛加重，伴有阴道流水，疑似胎膜早破，需紧急评估",
  },
  {
    id: "E002",
    taskId: "T005",
    patientId: "P010",
    level: "level2",
    reason: "胎盘早剥高危患者多次联系不上，存在失联风险",
    reporter: "U002",
    reporterName: "王护士",
    handler: "D002",
    handlerName: "李主任",
    status: "processing",
    createTime: "2026-06-16 10:30:00",
    handleTime: "2026-06-16 11:00:00",
    emergencyCode: "EMG-2026-002",
    isNightShift: false,
    description: "患者孕26周+3天，胎盘早剥高危，连续3次电话未接通，家属电话也占线，建议安排社区医生上门确认",
  },
  {
    id: "E003",
    taskId: "T009",
    patientId: "P008",
    level: "level1",
    reason: "羊水过少患者连续2天联系不上",
    reporter: "U001",
    reporterName: "李护士",
    handler: "D001",
    handlerName: "陈医生",
    status: "resolved",
    createTime: "2026-06-14 18:00:00",
    handleTime: "2026-06-14 18:30:00",
    resolveTime: "2026-06-15 09:30:00",
    result: "患者手机丢失，已通过家属联系上，情况良好，预约明日复诊",
    emergencyCode: "EMG-2026-003",
    isNightShift: false,
    description: "患者孕22周+1天，羊水过少，连续2天电话未接通",
  },
  {
    id: "E004",
    taskId: "T002",
    patientId: "P003",
    level: "level2",
    reason: "前置胎盘患者出现阴道出血",
    reporter: "U002",
    reporterName: "王护士",
    handler: "D002",
    handlerName: "李主任",
    status: "pending",
    createTime: "2026-06-16 10:35:00",
    emergencyCode: "EMG-2026-004",
    isNightShift: false,
    description: "患者孕24周+5天，完全性前置胎盘，今日出现少量阴道出血，需紧急处理",
  },
  {
    id: "E005",
    taskId: "T000",
    patientId: "P006",
    level: "level1",
    reason: "夜间突发腹痛",
    reporter: "U004",
    reporterName: "赵护士（夜班）",
    handler: "D003",
    handlerName: "孙医生（夜班）",
    status: "resolved",
    createTime: "2026-06-15 23:30:00",
    handleTime: "2026-06-15 23:35:00",
    resolveTime: "2026-06-16 01:30:00",
    result: "患者为假性宫缩，已安抚，建议观察，如有加重立即来院",
    emergencyCode: "EMG-2026-005",
    isNightShift: true,
    description: "患者夜间突发腹痛，经值班医生评估为假性宫缩",
  },
];

export const getEscalationByTaskId = (taskId: string): EscalationRecord | undefined => {
  return mockEscalationRecords.find((e) => e.taskId === taskId);
};

export const getEscalationsByPatientId = (patientId: string): EscalationRecord[] => {
  return mockEscalationRecords
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
};

export const getPendingEscalations = (): EscalationRecord[] => {
  return mockEscalationRecords.filter((e) => e.status === "pending" || e.status === "processing");
};

export const getTodayEscalations = (): EscalationRecord[] => {
  const today = new Date("2026-06-16");
  return mockEscalationRecords.filter((e) => {
    const createDate = new Date(e.createTime);
    return createDate.toDateString() === today.toDateString();
  });
};

export const generateEmergencyCode = (): string => {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `EMG-${year}-${num}`;
};
