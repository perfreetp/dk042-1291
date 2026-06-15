import { create } from "zustand";
import type { Task, TaskStatus, TaskPriority, TaskType, AssignHistoryItem, SmsRecord } from "@/types/task";
import { mockTasks } from "@/mock/tasks";
import type { CallLog } from "@/types/call";
import { mockCallLogs } from "@/mock/callLogs";
import { loadState, saveState } from "@/lib/persist";
import { generateId } from "@/lib/utils";

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
  updateCallLog: (callLogId: string, updates: Partial<CallLog>) => void;
  batchAssignTasks: (taskIds: string[], assignedTo: string, assignedName: string) => void;
  batchMarkSmsSent: (taskIds: string[]) => void;
  resetToDefaults: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => {
  const initialTasks = loadState<Task[]>("tasks", mockTasks);
  const initialCallLogs = loadState<CallLog[]>("callLogs", mockCallLogs);

  return {
  tasks: initialTasks,
  callLogs: initialCallLogs,
  selectedTask: null,
  filterStatus: "all",
  filterPriority: "all",
  filterType: "all",
  searchKeyword: "",
  loading: false,

  setTasks: (tasks) => {
    set({ tasks });
    saveState("tasks", tasks);
  },
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
    const newTasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, status, updateTime: new Date().toISOString() } : t
    );
    set({ tasks: newTasks });
    saveState("tasks", newTasks);
  },

  updateTask: (taskId, updates) => {
    const newTasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates, updateTime: new Date().toISOString() } : t
    );
    set({ tasks: newTasks });
    saveState("tasks", newTasks);
  },

  addTask: (task) => {
    const newTasks = [...get().tasks, task];
    set({ tasks: newTasks });
    saveState("tasks", newTasks);
  },

  addCallLog: (callLog) => {
    const newCallLogs = [...get().callLogs, callLog];
    set({ callLogs: newCallLogs });
    saveState("callLogs", newCallLogs);
  },

  getCallLogsByTaskId: (taskId) => {
    return get()
      .callLogs.filter((c) => c.taskId === taskId)
      .sort((a, b) => new Date(b.callTime).getTime() - new Date(a.callTime).getTime());
  },

  incrementRetryCount: (taskId) => {
    const newTasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, retryCount: t.retryCount + 1, updateTime: new Date().toISOString() } : t
    );
    set({ tasks: newTasks });
    saveState("tasks", newTasks);
  },

  updateCallLog: (callLogId, updates) => {
    const newCallLogs = get().callLogs.map((c) =>
      c.id === callLogId ? { ...c, ...updates } : c
    );
    set({ callLogs: newCallLogs });
    saveState("callLogs", newCallLogs);
  },

  batchAssignTasks: (taskIds, assignedTo, assignedName) => {
    const now = new Date().toISOString();
    const newTasks = get().tasks.map((t) => {
      if (!taskIds.includes(t.id)) return t;
      const historyItem: AssignHistoryItem = {
        id: generateId("AH"),
        assignedAt: now,
        assignedTo,
        assignedName,
        assignedBy: "N001",
        assignedByName: "李护士",
      };
      const prevHistory = t.assignHistory || [];
      return {
        ...t,
        assignedTo,
        assignedName,
        assignHistory: [...prevHistory, historyItem],
        updateTime: now,
      };
    });
    set({ tasks: newTasks });
    saveState("tasks", newTasks);
  },

  batchMarkSmsSent: (taskIds) => {
    const now = new Date().toISOString();
    const newTasks = get().tasks.map((t) => {
      if (!taskIds.includes(t.id)) return t;
      const smsRecord: SmsRecord = {
        id: generateId("SMS"),
        sentAt: now,
        content: t.description,
        sentBy: "N001",
        sentByName: "李护士",
      };
      const prevHistory = t.smsHistory || [];
      return {
        ...t,
        smsSent: true,
        smsSendTime: now,
        smsHistory: [...prevHistory, smsRecord],
        updateTime: now,
      };
    });
    set({ tasks: newTasks });
    saveState("tasks", newTasks);
  },

  resetToDefaults: () => {
    set({ tasks: mockTasks, callLogs: mockCallLogs });
    saveState("tasks", mockTasks);
    saveState("callLogs", mockCallLogs);
  },
}});
