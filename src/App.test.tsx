import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates, completes, and deletes a todo", async () => {
    render(<App />);

    expect(screen.getByText("还没有小目标")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "新增目标" }));
    fireEvent.change(screen.getByLabelText("事项名称"), {
      target: { value: "完成周报" },
    });
    fireEvent.change(screen.getByLabelText("目标"), {
      target: { value: "整理本周成果并发出" },
    });
    fireEvent.change(screen.getByLabelText("截止时间"), {
      target: { value: "2030-01-02T18:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "创建目标" }));

    const pendingCard = await screen.findByRole("article", {
      name: "完成周报",
    });
    expect(within(pendingCard).getByText("整理本周成果并发出")).toBeVisible();

    fireEvent.click(
      within(pendingCard).getByRole("button", { name: "完成「完成周报」" }),
    );
    fireEvent.change(screen.getByLabelText("完成情况"), {
      target: { value: "周报已发送" },
    });
    fireEvent.change(screen.getByLabelText("遇到的问题"), {
      target: { value: "数据收集稍晚" },
    });
    fireEvent.click(screen.getByRole("button", { name: "确认完成" }));

    const completedCard = await screen.findByRole("article", {
      name: "完成周报",
    });
    expect(within(completedCard).getAllByText("已完成")).toHaveLength(2);
    expect(within(completedCard).getByText("周报已发送")).toBeVisible();
    expect(within(completedCard).getByText("数据收集稍晚")).toBeVisible();

    await waitFor(() => {
      expect(window.localStorage.getItem("one-small-goal:v1")).toContain(
        "完成周报",
      );
    });

    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(
      within(completedCard).getByRole("button", { name: "删除「完成周报」" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("article", { name: "完成周报" }),
      ).not.toBeInTheDocument();
    });
  });
});
