import { useState, type FormEvent } from "react";
import { getDefaultDueAt } from "../lib/dates";
import type { TodoInput } from "../types";
import { Modal } from "./Modal";

interface CreateTodoDialogProps {
  onClose: () => void;
  onCreate: (input: TodoInput) => void;
}

export function CreateTodoDialog({
  onClose,
  onCreate,
}: CreateTodoDialogProps) {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [dueAt, setDueAt] = useState(() => getDefaultDueAt());
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !goal.trim() || !dueAt) {
      setError("请完整填写事项、目标和截止时间。");
      return;
    }
    onCreate({ title, goal, dueAt });
  };

  return (
    <Modal
      title="新增一个小目标"
      description="把想完成的事写清楚，再给它一个明确的时间。"
      onClose={onClose}
      size="wide"
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="todo-title">事项名称</label>
          <input
            id="todo-title"
            autoFocus
            value={title}
            maxLength={80}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：完成本周产品原型"
          />
        </div>

        <div className="field">
          <label htmlFor="todo-goal">目标</label>
          <textarea
            id="todo-goal"
            value={goal}
            maxLength={400}
            rows={4}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="希望达到什么结果？例如：完成首页和详情页，能够进行一轮内部评审。"
          />
          <span className="field-hint">{goal.length}/400</span>
        </div>

        <div className="field">
          <label htmlFor="todo-due-at">截止时间</label>
          <input
            id="todo-due-at"
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="button button--primary">
            创建目标
          </button>
        </div>
      </form>
    </Modal>
  );
}
