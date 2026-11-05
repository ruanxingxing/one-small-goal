import type {
  CompletionInput,
  Todo,
  TodoFilter,
  TodoInput,
} from "../types";
import { isSameLocalDay } from "./dates";

export const STORAGE_KEY = "one-small-goal:v1";

export function createTodo(input: TodoInput, now = new Date()): Todo {
  const title = input.title.trim();
  const goal = input.goal.trim();

  if (!title) {
    throw new Error("事项名称不能为空");
  }
  if (!goal) {
    throw new Error("目标不能为空");
  }
  if (!input.dueAt || Number.isNaN(new Date(input.dueAt).getTime())) {
    throw new Error("请选择有效的截止时间");
  }

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `todo-${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    goal,
    dueAt: new Date(input.dueAt).toISOString(),
    status: "pending",
    completionNote: "",
    problems: "",
    createdAt: now.toISOString(),
    completedAt: null,
  };
}

export function isOverdue(todo: Todo, now = new Date()): boolean {
  return (
    todo.status === "pending" &&
    new Date(todo.dueAt).getTime() < now.getTime()
  );
}

export function completeTodo(
  todo: Todo,
  input: CompletionInput,
  now = new Date(),
): Todo {
  return {
    ...todo,
    status: "completed",
    completionNote: input.completionNote.trim(),
    problems: input.problems.trim(),
    completedAt: now.toISOString(),
  };
}

export function reopenTodo(todo: Todo): Todo {
  return {
    ...todo,
    status: "pending",
    completedAt: null,
  };
}

export function filterTodos(
  todos: Todo[],
  filter: TodoFilter,
  query = "",
  now = new Date(),
): Todo[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  return todos.filter((todo) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && todo.status === "pending") ||
      (filter === "completed" && todo.status === "completed") ||
      (filter === "overdue" && isOverdue(todo, now));

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [todo.title, todo.goal, todo.completionNote, todo.problems]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(normalizedQuery);
  });
}

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "pending" ? -1 : 1;
    }

    if (left.status === "completed") {
      return (
        new Date(right.completedAt ?? right.createdAt).getTime() -
        new Date(left.completedAt ?? left.createdAt).getTime()
      );
    }

    return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
  });
}

export interface TodoStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
}

export function getTodoStats(todos: Todo[], now = new Date()): TodoStats {
  const pending = todos.filter((todo) => todo.status === "pending").length;
  const completed = todos.filter((todo) => todo.status === "completed").length;
  const overdue = todos.filter((todo) => isOverdue(todo, now)).length;
  const dueToday = todos.filter(
    (todo) =>
      todo.status === "pending" &&
      isSameLocalDay(new Date(todo.dueAt), now),
  ).length;

  return {
    total: todos.length,
    pending,
    completed,
    overdue,
    dueToday,
    completionRate:
      todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100),
  };
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.goal === "string" &&
    typeof item.dueAt === "string" &&
    !Number.isNaN(new Date(item.dueAt).getTime()) &&
    (item.status === "pending" || item.status === "completed") &&
    typeof item.completionNote === "string" &&
    typeof item.problems === "string" &&
    typeof item.createdAt === "string" &&
    (item.completedAt === null || typeof item.completedAt === "string")
  );
}

export function loadTodos(storage: Storage = window.localStorage): Todo[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTodo) : [];
  } catch {
    return [];
  }
}

export function saveTodos(
  todos: Todo[],
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // A failed write should not make the whole application unusable.
  }
}
