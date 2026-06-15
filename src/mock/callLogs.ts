import type { CallLog } from "@/types/call";

export const mockCallLogs: CallLog[] = [
  {
    id: "C001",
    taskId: "T007",
    patientId: "P009",
    caller: "U003",
    callerName: "张护士",
    callTime: "2026-06-15 15:20:00",
    duration: 180,
    status: "connected",
    result: "confirmed",
    note: "患者已了解胎儿体重偏大情况，同意控制饮食并增加运动，已预约下周产检",
    familyJoined: false,
    nextFollowUpTime: "2026-06-22 10:00:00",
  },
  {
    id: "C002",
    taskId: "T007",
    patientId: "P009",
    caller: "U003",
    callerName: "张护士",
    callTime: "2026-06-15 14:30:00",
    duration: 0,
    status: "no_answer",
    result: "failed",
    note: "首次拨打未接听",
    familyJoined: false,
  },
  {
    id: "C003",
    taskId: "T008",
    patientId: "P005",
    caller: "U002",
    callerName: "王护士",
    callTime: "2026-06-14 10:15:00",
    duration: 240,
    status: "connected",
    result: "confirmed",
    note: "双胎妊娠情况良好，患者无不适症状，提醒注意休息和营养",
    familyJoined: true,
    familyName: "王刚",
    familyRelation: "丈夫",
    nextFollowUpTime: "2026-06-21 10:00:00",
  },
  {
    id: "C004",
    taskId: "T005",
    patientId: "P010",
    caller: "U002",
    callerName: "王护士",
    callTime: "2026-06-16 09:30:00",
    duration: 0,
    status: "no_answer",
    result: "failed",
    note: "第三次拨打仍未接听",
    familyJoined: false,
  },
  {
    id: "C005",
    taskId: "T005",
    patientId: "P010",
    caller: "U002",
    callerName: "王护士",
    callTime: "2026-06-16 09:45:00",
    duration: 0,
    status: "busy",
    result: "failed",
    note: "家属电话占线",
    familyJoined: false,
  },
  {
    id: "C006",
    taskId: "T002",
    patientId: "P003",
    caller: "U002",
    callerName: "王护士",
    callTime: "2026-06-16 10:45:00",
    duration: 0,
    status: "no_answer",
    result: "failed",
    note: "首次拨打未接听",
    familyJoined: false,
  },
  {
    id: "C007",
    taskId: "T003",
    patientId: "P007",
    caller: "U001",
    callerName: "李护士",
    callTime: "2026-06-16 13:45:00",
    duration: 300,
    status: "connected",
    result: "pending",
    note: "患者表示近期腹胀明显，已建议减少饮水量，注意观察胎动，如有不适立即就医",
    familyJoined: false,
    nextFollowUpTime: "2026-06-17 09:00:00",
  },
  {
    id: "C008",
    taskId: "T012",
    patientId: "P007",
    caller: "U002",
    callerName: "王护士",
    callTime: "2026-06-16 15:40:00",
    duration: 180,
    status: "connected",
    result: "escalated",
    note: "患者腹痛加重，伴有阴道流水症状，已立即升级至值班医生处理",
    familyJoined: true,
    familyName: "陈军",
    familyRelation: "丈夫",
  },
];

export const getCallLogsByTaskId = (taskId: string): CallLog[] => {
  return mockCallLogs.filter((c) => c.taskId === taskId).sort((a, b) => new Date(b.callTime).getTime() - new Date(a.callTime).getTime());
};

export const getCallLogsByPatientId = (patientId: string): CallLog[] => {
  return mockCallLogs.filter((c) => c.patientId === patientId).sort((a, b) => new Date(b.callTime).getTime() - new Date(a.callTime).getTime());
};

export const getTodayCallLogs = (): CallLog[] => {
  const today = new Date("2026-06-16");
  return mockCallLogs.filter((c) => {
    const callDate = new Date(c.callTime);
    return callDate.toDateString() === today.toDateString();
  });
};
