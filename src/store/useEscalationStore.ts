import { create } from "zustand";
import type { EscalationRecord, EscalationLevel, EscalationStatus } from "@/types/escalation";
import { mockEscalationRecords, generateEmergencyCode } from "@/mock/escalation";

interface EscalationStore {
  records: EscalationRecord[];
  selectedRecord: EscalationRecord | null;
  filterStatus: EscalationStatus | "all";
  filterLevel: EscalationLevel | "all";
  loading: boolean;
  setRecords: (records: EscalationRecord[]) => void;
  setSelectedRecord: (record: EscalationRecord | null) => void;
  setFilterStatus: (status: EscalationStatus | "all") => void;
  setFilterLevel: (level: EscalationLevel | "all") => void;
  getFilteredRecords: () => EscalationRecord[];
  getRecordById: (id: string) => EscalationRecord | undefined;
  getRecordsByTaskId: (taskId: string) => EscalationRecord[];
  getRecordsByPatientId: (patientId: string) => EscalationRecord[];
  getPendingRecords: () => EscalationRecord[];
  getTodayRecords: () => EscalationRecord[];
  addRecord: (record: Omit<EscalationRecord, "id" | "emergencyCode" | "createTime">) => void;
  updateRecordStatus: (id: string, status: EscalationStatus, handler?: string, handlerName?: string) => void;
  updateRecord: (id: string, updates: Partial<EscalationRecord>) => void;
  escalateLevel: (id: string, newLevel: EscalationLevel, reason: string) => void;
  getNightShiftRecords: () => EscalationRecord[];
}

export const useEscalationStore = create<EscalationStore>((set, get) => ({
  records: mockEscalationRecords,
  selectedRecord: null,
  filterStatus: "all",
  filterLevel: "all",
  loading: false,

  setRecords: (records) => set({ records }),
  setSelectedRecord: (record) => set({ selectedRecord: record }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterLevel: (level) => set({ filterLevel: level }),

  getFilteredRecords: () => {
    const { records, filterStatus, filterLevel } = get();
    return records.filter((record) => {
      if (filterStatus !== "all" && record.status !== filterStatus) return false;
      if (filterLevel !== "all" && record.level !== filterLevel) return false;
      return true;
    }).sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getRecordById: (id) => {
    return get().records.find((r) => r.id === id);
  },

  getRecordsByTaskId: (taskId) => {
    return get()
      .records.filter((r) => r.taskId === taskId)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getRecordsByPatientId: (patientId) => {
    return get()
      .records.filter((r) => r.patientId === patientId)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getPendingRecords: () => {
    return get().records.filter((r) => r.status === "pending" || r.status === "processing");
  },

  getTodayRecords: () => {
    const today = new Date("2026-06-16");
    return get().records.filter((r) => {
      const createDate = new Date(r.createTime);
      return createDate.toDateString() === today.toDateString();
    });
  },

  addRecord: (record) => {
    const newRecord: EscalationRecord = {
      ...record,
      id: `E${Date.now()}`,
      emergencyCode: generateEmergencyCode(),
      createTime: new Date().toISOString(),
    };
    set((state) => ({
      records: [newRecord, ...state.records],
    }));
  },

  updateRecordStatus: (id, status, handler, handlerName) => {
    set((state) => ({
      records: state.records.map((r) => {
        if (r.id !== id) return r;
        const updates: Partial<EscalationRecord> = { status };
        if (handler) updates.handler = handler;
        if (handlerName) updates.handlerName = handlerName;
        if (status === "processing") updates.handleTime = new Date().toISOString();
        if (status === "resolved") updates.resolveTime = new Date().toISOString();
        return { ...r, ...updates };
      }),
    }));
  },

  updateRecord: (id, updates) => {
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },

  escalateLevel: (id, newLevel, reason) => {
    set((state) => ({
      records: state.records.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          level: newLevel,
          reason: r.reason + "；" + reason,
          status: "pending",
          handler: undefined,
          handlerName: undefined,
          handleTime: undefined,
        };
      }),
    }));
  },

  getNightShiftRecords: () => {
    return get().records.filter((r) => r.isNightShift);
  },
}));
