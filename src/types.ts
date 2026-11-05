export type TodoStatus = "pending" | "completed";

export interface Todo {
  id: string;
  title: string;
  goal: string;
  dueAt: string;
  status: TodoStatus;
  completionNote: string;
  problems: string;
  createdAt: string;
  completedAt: string | null;
}

export interface TodoInput {
  title: string;
  goal: string;
  dueAt: string;
}

export interface CompletionInput {
  completionNote: string;
  problems: string;
}

export type TodoFilter = "all" | "pending" | "completed" | "overdue";
