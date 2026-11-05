import { describeDue, formatDateTime } from "../lib/dates";
import type { Todo } from "../types";
import { Icon } from "./Icon";

interface TodoCardProps {
  todo: Todo;
  onComplete: () => void;
  onEditNotes: () => void;
  onDelete: () => void;
  onReopen: () => void;
}

export function TodoCard({
  todo,
  onComplete,
  onEditNotes,
  onDelete,
  onReopen,
}: TodoCardProps) {
  const due = describeDue(todo);
  const hasNotes = Boolean(todo.completionNote || todo.problems);

  return (
    <article
      className={`todo-card todo-card--${due.tone}`}
      aria-label={todo.title}
    >
      <div className="todo-card__top">
        <span className={`status-pill status-pill--${todo.status}`}>
          {todo.status === "completed" ? "已完成" : "进行中"}
        </span>
        <span className={`due-badge due-badge--${due.tone}`}>{due.label}</span>
      </div>

      <div className="todo-card__heading">
        <div>
          <h2>{todo.title}</h2>
          <p className="due-detail">
            <Icon name="calendar" size={15} />
            {due.detail}
          </p>
        </div>
      </div>

      <div className="goal-block">
        <span className="goal-block__label">
          <Icon name="target" size={15} />
          目标
        </span>
        <p>{todo.goal}</p>
      </div>

      {hasNotes ? (
        <div className="notes-summary">
          {todo.completionNote ? (
            <div>
              <span>完成情况</span>
              <p>{todo.completionNote}</p>
            </div>
          ) : null}
          {todo.problems ? (
            <div className="notes-summary__problem">
              <span>遇到的问题</span>
              <p>{todo.problems}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <footer className="todo-card__footer">
        <span className="created-at">
          创建于 {formatDateTime(todo.createdAt)}
        </span>
        <div className="card-actions">
          {todo.status === "pending" ? (
            <>
              <button
                type="button"
                className="text-button"
                aria-label={`记录「${todo.title}」的进展`}
                onClick={onEditNotes}
              >
                <Icon name="edit" size={16} />
                记录
              </button>
              <button
                type="button"
                className="button button--small button--primary"
                aria-label={`完成「${todo.title}」`}
                onClick={onComplete}
              >
                <Icon name="check" size={16} />
                完成
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="text-button"
                aria-label={`修改「${todo.title}」的完成记录`}
                onClick={onEditNotes}
              >
                <Icon name="edit" size={16} />
                修改记录
              </button>
              <button
                type="button"
                className="text-button"
                aria-label={`重新打开「${todo.title}」`}
                onClick={onReopen}
              >
                <Icon name="reopen" size={16} />
                重新打开
              </button>
            </>
          )}
          <button
            type="button"
            className="icon-button icon-button--danger"
            aria-label={`删除「${todo.title}」`}
            onClick={onDelete}
          >
            <Icon name="trash" size={17} />
          </button>
        </div>
      </footer>
    </article>
  );
}
