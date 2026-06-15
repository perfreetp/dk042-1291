import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, addDays, addHours } from "date-fns";
import { zhCN } from "date-fns/locale";

export const formatDateTime = (date: string | Date, pattern: string = "yyyy-MM-dd HH:mm:ss"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd", { locale: zhCN });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
};

export const getRemainingTime = (deadline: string | Date): { hours: number; minutes: number; isOverdue: boolean; text: string } => {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  const isOverdue = diffMs < 0;
  const absHours = Math.abs(diffHours);
  const absMinutes = Math.abs(diffMins) % 60;

  let text = "";
  if (isOverdue) {
    if (absHours > 0) {
      text = `已超时 ${absHours}小时${absMinutes}分`;
    } else {
      text = `已超时 ${absMinutes}分钟`;
    }
  } else {
    if (diffHours > 0) {
      text = `剩余 ${diffHours}小时${diffMins % 60}分`;
    } else {
      text = `剩余 ${diffMins}分钟`;
    }
  }

  return {
    hours: diffHours,
    minutes: diffMins,
    isOverdue,
    text,
  };
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}分${secs}秒`;
  }
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}小时${remainMins}分`;
};

export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3");
};

export const getWeeksDaysText = (weeks: number, days: number): string => {
  return `${weeks}周${days}天`;
};

export const isNightTime = (date: string | Date): boolean => {
  const d = typeof date === "string" ? new Date(date) : date;
  const hour = d.getHours();
  return hour >= 22 || hour < 8;
};

export const getDeadlineText = (deadline: string): string => {
  const { isOverdue, text } = getRemainingTime(deadline);
  return text;
};

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};
