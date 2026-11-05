import type { Todo } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return dateTimeFormatter.format(date);
}

export function isSameLocalDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function getDefaultDueAt(now = new Date()): string {
  const due = new Date(now);
  due.setDate(due.getDate() + 1);
  due.setHours(18, 0, 0, 0);
  return toDateTimeLocalValue(due);
}

export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export function formatToday(now = new Date()): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
}

export interface DueDescriptor {
  label: string;
  detail: string;
  tone: "normal" | "soon" | "overdue" | "completed";
}

export function describeDue(todo: Todo, now = new Date()): DueDescriptor {
  if (todo.status === "completed") {
    return {
      label: "已完成",
      detail: todo.completedAt
        ? `完成于 ${formatDateTime(todo.completedAt)}`
        : "已完成",
      tone: "completed",
    };
  }

  const due = new Date(todo.dueAt);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) {
    const overdueHours = Math.max(1, Math.ceil(Math.abs(diffMs) / 3_600_000));
    return {
      label: "已逾期",
      detail:
        overdueHours < 24
          ? `逾期 ${overdueHours} 小时 · ${shortDateTimeFormatter.format(due)}`
          : `原定 ${formatDateTime(due)}`,
      tone: "overdue",
    };
  }

  if (isSameLocalDay(due, now)) {
    return {
      label: "今天截止",
      detail: shortDateTimeFormatter.format(due),
      tone: "soon",
    };
  }

  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);
  if (isSameLocalDay(due, nextDay)) {
    return {
      label: "明天截止",
      detail: shortDateTimeFormatter.format(due),
      tone: "normal",
    };
  }

  return {
    label: "截止时间",
    detail: formatDateTime(due),
    tone: "normal",
  };
}
