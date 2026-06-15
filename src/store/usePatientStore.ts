import { create } from "zustand";
import type { Patient } from "@/types/patient";
import { mockPatients } from "@/mock/patients";

interface PatientStore {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  getPatientById: (id: string) => Patient | undefined;
  getHighRiskPatients: () => Patient[];
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addPatient: (patient: Patient) => void;
  getLostFollowPatients: () => Patient[];
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: mockPatients,
  selectedPatient: null,
  loading: false,

  setPatients: (patients) => set({ patients }),

  setSelectedPatient: (patient) => set({ selectedPatient: patient }),

  getPatientById: (id) => {
    return get().patients.find((p) => p.id === id);
  },

  getHighRiskPatients: () => {
    return get().patients.filter((p) => p.riskLevel === "high");
  },

  getLostFollowPatients: () => {
    return get().patients.filter((p) => p.isLostFollow);
  },

  updatePatient: (id, updates) => {
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  addPatient: (patient) => {
    set((state) => ({
      patients: [...state.patients, patient],
    }));
  },
}));
