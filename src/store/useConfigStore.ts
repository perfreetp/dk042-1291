import { create } from "zustand";
import type { ReminderRule, AbnormalThreshold } from "@/types/config";
import { mockReminderRules, mockAbnormalThresholds } from "@/mock/config";
import { loadState, saveState } from "@/lib/persist";

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
  resetToDefaults: () => void;
}

export const useConfigStore = create<ConfigStore>((set, get) => {
  const initialRules = loadState<ReminderRule[]>("reminderRules", mockReminderRules);
  const initialThresholds = loadState<AbnormalThreshold[]>("abnormalThresholds", mockAbnormalThresholds);

  return {
  reminderRules: initialRules,
  abnormalThresholds: initialThresholds,
  selectedRule: null,
  selectedThreshold: null,
  loading: false,

  setReminderRules: (rules) => {
    set({ reminderRules: rules });
    saveState("reminderRules", rules);
  },
  setAbnormalThresholds: (thresholds) => {
    set({ abnormalThresholds: thresholds });
    saveState("abnormalThresholds", thresholds);
  },
  setSelectedRule: (rule) => set({ selectedRule: rule }),
  setSelectedThreshold: (threshold) => set({ selectedThreshold: threshold }),

  getRuleById: (id) => {
    return get().reminderRules.find((r) => r.id === id);
  },

  getThresholdById: (id) => {
    return get().abnormalThresholds.find((t) => t.id === id);
  },

  toggleRuleEnabled: (id) => {
    const newRules = get().reminderRules.map((r) =>
      r.id === id
        ? { ...r, enabled: !r.enabled, updateTime: new Date().toISOString() }
        : r
    );
    set({ reminderRules: newRules });
    saveState("reminderRules", newRules);
  },

  toggleThresholdEnabled: (id) => {
    const newThresholds = get().abnormalThresholds.map((t) =>
      t.id === id
        ? { ...t, enabled: !t.enabled }
        : t
    );
    set({ abnormalThresholds: newThresholds });
    saveState("abnormalThresholds", newThresholds);
  },

  updateRule: (id, updates) => {
    const newRules = get().reminderRules.map((r) =>
      r.id === id ? { ...r, ...updates, updateTime: new Date().toISOString() } : r
    );
    set({ reminderRules: newRules });
    saveState("reminderRules", newRules);
  },

  updateThreshold: (id, updates) => {
    const newThresholds = get().abnormalThresholds.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    set({ abnormalThresholds: newThresholds });
    saveState("abnormalThresholds", newThresholds);
  },

  addRule: (rule) => {
    const newRules = [...get().reminderRules, rule];
    set({ reminderRules: newRules });
    saveState("reminderRules", newRules);
  },

  addThreshold: (threshold) => {
    const newThresholds = [...get().abnormalThresholds, threshold];
    set({ abnormalThresholds: newThresholds });
    saveState("abnormalThresholds", newThresholds);
  },

  deleteRule: (id) => {
    const newRules = get().reminderRules.filter((r) => r.id !== id);
    set({ reminderRules: newRules });
    saveState("reminderRules", newRules);
  },

  deleteThreshold: (id) => {
    const newThresholds = get().abnormalThresholds.filter((t) => t.id !== id);
    set({ abnormalThresholds: newThresholds });
    saveState("abnormalThresholds", newThresholds);
  },

  getEnabledRules: () => {
    return get().reminderRules.filter((r) => r.enabled);
  },

  resetToDefaults: () => {
    set({ reminderRules: mockReminderRules, abnormalThresholds: mockAbnormalThresholds });
    saveState("reminderRules", mockReminderRules);
    saveState("abnormalThresholds", mockAbnormalThresholds);
  },
}});
