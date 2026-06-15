import { create } from "zustand";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { mockTasks } from "@/mock/tasks";
import type { CallLog } from "@/types/call";
import { mockCallLogs } from "@/mock/callLogs";

interface TaskStore {
  tasks: Task[];
  callLogs: CallLog[];
  selectedTask: Task | null;
  filterStatus: TaskStatus | "all";
  filterPriority: TaskPriority | "all";
  filterType: TaskType | "all";
  searchKeyword: string;
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task | null) => void;
  setFilterStatus: (status: TaskStatus | "all") => void;
  setFilterPriority: (priority: TaskPriority | "all") => void;
  setFilterType: (type: TaskType | "all") => void;
  setSearchKeyword: (keyword: string) => void;
  getFilteredTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getPendingTasks: () => Task[];
  getTodayTasks: () => Task[];
  getTasksByPatientId: (patientId: string) => Task[];
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  addCallLog: (callLog: CallLog) => void;
  getCallLogsByTaskId: (taskId: string) => CallLog[];
  incrementRetryCount: (taskId: string) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  callLogs: mockCallLogs,
  selectedTask: null,
  filterStatus: "all",
  filterPriority: "all",
  filterType: "all",
  searchKeyword: "",
  loading: false,

  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterType: (type) => set({ filterType: type }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  getFilteredTasks: () => {
    const { tasks, filterStatus, filterPriority, filterType, searchKeyword } = get();
    return tasks.filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      if (filterType !== "all" && task.taskType !== filterType) return false;
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const patientName = task.patient?.name.toLowerCase() || "";
        const patientPhone = task.patient?.phone || "";
        const desc = task.description.toLowerCase();
        if (
          !patientName.includes(keyword) &&
          !patientPhone.includes(keyword) &&
          !desc.includes(keyword) &&
          !task.id.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }
      return true;
    });
  },

  getTaskById: (id) => {
    return get().tasks.find((t) => t.id === id);
  },

  getPendingTasks: () => {
    return get().tasks.filter((t) => t.status === "pending" || t.status === "processing");
  },

  getTodayTasks: () => {
    const today = new Date("2026-06-16");
    return get().tasks.filter((t) => {
      const triggerDate = new Date(t.triggerTime);
      return triggerDate.toDateString() === today.toDateString();
    });
  },

  getTasksByPatientId: (patientId) => {
    return get()
      .tasks.filter((t) => t.patientId === patientId)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status, updateTime: new Date().toISOString() } : t
      ),
    }));
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updateTime: new Date().toISOString() } : t
      ),
    }));
  },

  addTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task],
    }));
  },

  addCallLog: (callLog) => {
    set((state) => ({
      callLogs: [...state.callLogs, callLog],
    }));
  },

  getCallLogsByTaskId: (taskId) => {
    return get()
      .callLogs.filter((c) => c.taskId === taskId)
      .sort((a, b) => new Date(b.callTime).getTime() - new Date(a.callTime).getTime());
  },

  incrementRetryCount: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, retryCount: t.retryCount + 1, updateTime: new Date().toISOString() } : t
      ),
    }));
  },
}));
