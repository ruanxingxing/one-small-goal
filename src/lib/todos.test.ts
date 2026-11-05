import { describe, expect, it } from "vitest";
import type { Todo } from "../types";
import {
  completeTodo,
  createTodo,
  filterTodos,
  getTodoStats,
  isOverdue,
  loadTodos,
  reopenTodo,
  saveTodos,
  sortTodos,
  STORAGE_KEY,
} from "./todos";

const now = new Date("2026-11-05T09:00:00+08:00");

function makeTodo(
  overrides: Partial<Todo> & Pick<Todo, "title" | "dueAt">,
): Todo {
  return {
    id: overrides.id ?? overrides.title,
    goal: overrides.goal ?? "完成一个明确结果",
    status: overrides.status ?? "pending",
    completionNote: overrides.completionNote ?? "",
    problems: overrides.problems ?? "",
    createdAt: overrides.createdAt ?? now.toISOString(),
    completedAt: overrides.completedAt ?? null,
    ...overrides,
  };
}

describe("todo domain", () => {
  it("creates a trimmed pending todo", () => {
    const todo = createTodo(
      {
        title: "  写周报  ",
        goal: "  总结本周结果  ",
        dueAt: "2026-11-06T18:00",
      },
      now,
    );

    expect(todo.title).toBe("写周报");
    expect(todo.goal).toBe("总结本周结果");
    expect(todo.status).toBe("pending");
    expect(todo.completedAt).toBeNull();
  });

  it("rejects incomplete input", () => {
    expect(() =>
      createTodo({ title: "", goal: "目标", dueAt: "2026-11-06T18:00" }),
    ).toThrow("事项名称不能为空");
  });

  it("detects only pending overdue todos", () => {
    const overdue = makeTodo({
      title: "逾期事项",
      dueAt: "2026-11-05T08:00:00+08:00",
    });
    const completed = makeTodo({
      title: "已完成事项",
      dueAt: "2026-11-05T08:00:00+08:00",
      status: "completed",
    });

    expect(isOverdue(overdue, now)).toBe(true);
    expect(isOverdue(completed, now)).toBe(false);
  });

  it("records completion data and supports reopening", () => {
    const todo = makeTodo({
      title: "完成原型",
      dueAt: "2026-11-06T18:00:00+08:00",
    });
    const completed = completeTodo(
      todo,
      { completionNote: "完成两页", problems: "素材不足" },
      now,
    );
    const reopened = reopenTodo(completed);

    expect(completed.status).toBe("completed");
    expect(completed.completionNote).toBe("完成两页");
    expect(completed.problems).toBe("素材不足");
    expect(reopened.status).toBe("pending");
    expect(reopened.completedAt).toBeNull();
  });

  it("filters and searches across notes", () => {
    const first = makeTodo({
      title: "设计首页",
      goal: "完成视觉稿",
      dueAt: "2026-11-05T10:00:00+08:00",
      problems: "字体授权待确认",
    });
    const second = makeTodo({
      title: "整理会议纪要",
      goal: "形成决策记录",
      dueAt: "2026-11-03T10:00:00+08:00",
      status: "completed",
      completedAt: "2026-11-04T10:00:00+08:00",
    });

    expect(filterTodos([first, second], "pending", "", now)).toEqual([first]);
    expect(filterTodos([first, second], "overdue", "", now)).toEqual([]);
    expect(filterTodos([first, second], "all", "字体", now)).toEqual([first]);
    expect(filterTodos([first, second], "completed", "", now)).toEqual([
      second,
    ]);
  });

  it("calculates statistics", () => {
    const todos = [
      makeTodo({
        title: "今天",
        dueAt: "2026-11-05T18:00:00+08:00",
      }),
      makeTodo({
        title: "逾期",
        dueAt: "2026-11-04T18:00:00+08:00",
      }),
      makeTodo({
        title: "完成",
        dueAt: "2026-11-04T18:00:00+08:00",
        status: "completed",
        completedAt: "2026-11-04T17:00:00+08:00",
      }),
    ];

    expect(getTodoStats(todos, now)).toMatchObject({
      total: 3,
      pending: 2,
      completed: 1,
      overdue: 1,
      dueToday: 1,
      completionRate: 33,
    });
  });

  it("sorts pending by deadline before completed items", () => {
    const completed = makeTodo({
      title: "已完成",
      dueAt: "2026-11-06T18:00:00+08:00",
      status: "completed",
      completedAt: "2026-11-05T08:00:00+08:00",
    });
    const later = makeTodo({
      title: "稍后",
      dueAt: "2026-11-07T18:00:00+08:00",
    });
    const sooner = makeTodo({
      title: "先做",
      dueAt: "2026-11-05T18:00:00+08:00",
    });

    expect(sortTodos([completed, later, sooner]).map((todo) => todo.title)).toEqual(
      ["先做", "稍后", "已完成"],
    );
  });

  it("persists valid todos and ignores invalid storage", () => {
    const storage = window.localStorage;
    const todo = makeTodo({
      title: "持久化",
      dueAt: "2026-11-06T18:00:00+08:00",
    });

    saveTodos([todo], storage);
    expect(loadTodos(storage)).toEqual([todo]);

    storage.setItem(STORAGE_KEY, "{broken");
    expect(loadTodos(storage)).toEqual([]);
  });
});
