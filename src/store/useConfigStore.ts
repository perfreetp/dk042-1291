import { create } from "zustand";
import type { ReminderRule, AbnormalThreshold } from "@/types/config";
import { mockReminderRules, mockAbnormalThresholds } from "@/mock/config";

interface ConfigStore {
  reminderRules: ReminderRule[];
  abnormalThresholds: AbnormalThreshold[];
  selectedRule: ReminderRule | null;
  selectedThreshold: AbnormalThreshold | null;
  loading: boolean;
  setReminderRules: (rules: ReminderRule[]) => void;
  setAbnormalThresholds: (thresholds: AbnormalThreshold[]) => void;
  setSelectedRule: (rule: ReminderRule | null) => void;
  setSelectedThreshold: (threshold: AbnormalThreshold | null) => void;
  getRuleById: (id: string) => ReminderRule | undefined;
  getThresholdById: (id: string) => AbnormalThreshold | undefined;
  toggleRuleEnabled: (id: string) => void;
  toggleThresholdEnabled: (id: string) => void;
  updateRule: (id: string, updates: Partial<ReminderRule>) => void;
  updateThreshold: (id: string, updates: Partial<AbnormalThreshold>) => void;
  addRule: (rule: ReminderRule) => void;
  addThreshold: (threshold: AbnormalThreshold) => void;
  deleteRule: (id: string) => void;
  deleteThreshold: (id: string) => void;
  getEnabledRules: () => ReminderRule[];
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  reminderRules: mockReminderRules,
  abnormalThresholds: mockAbnormalThresholds,
  selectedRule: null,
  selectedThreshold: null,
  loading: false,

  setReminderRules: (rules) => set({ reminderRules: rules }),
  setAbnormalThresholds: (thresholds) => set({ abnormalThresholds: thresholds }),
  setSelectedRule: (rule) => set({ selectedRule: rule }),
  setSelectedThreshold: (threshold) => set({ selectedThreshold: threshold }),

  getRuleById: (id) => {
    return get().reminderRules.find((r) => r.id === id);
  },

  getThresholdById: (id) => {
    return get().abnormalThresholds.find((t) => t.id === id);
  },

  toggleRuleEnabled: (id) => {
    set((state) => ({
      reminderRules: state.reminderRules.map((r) =>
        r.id === id
          ? { ...r, enabled: !r.enabled, updateTime: new Date().toISOString() }
          : r
      ),
    }));
  },

  toggleThresholdEnabled: (id) => {
    set((state) => ({
      abnormalThresholds: state.abnormalThresholds.map((t) =>
        t.id === id
          ? { ...t, enabled: !t.enabled }
          : t
      ),
    }));
  },

  updateRule: (id, updates) => {
    set((state) => ({
      reminderRules: state.reminderRules.map((r) =>
        r.id === id ? { ...r, ...updates, updateTime: new Date().toISOString() } : r
      ),
    }));
  },

  updateThreshold: (id, updates) => {
    set((state) => ({
      abnormalThresholds: state.abnormalThresholds.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  addRule: (rule) => {
    set((state) => ({
      reminderRules: [...state.reminderRules, rule],
    }));
  },

  addThreshold: (threshold) => {
    set((state) => ({
      abnormalThresholds: [...state.abnormalThresholds, threshold],
    }));
  },

  deleteRule: (id) => {
    set((state) => ({
      reminderRules: state.reminderRules.filter((r) => r.id !== id),
    }));
  },

  deleteThreshold: (id) => {
    set((state) => ({
      abnormalThresholds: state.abnormalThresholds.filter((t) => t.id !== id),
    }));
  },

  getEnabledRules: () => {
    return get().reminderRules.filter((r) => r.enabled);
  },
}));
