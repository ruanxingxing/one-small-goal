import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CompletionDialog } from "./components/CompletionDialog";
import { CreateTodoDialog } from "./components/CreateTodoDialog";
import { Icon } from "./components/Icon";
import { NotesDialog } from "./components/NotesDialog";
import { TodoCard } from "./components/TodoCard";
import { formatToday } from "./lib/dates";
import {
  completeTodo,
  createTodo,
  filterTodos,
  getTodoStats,
  loadTodos,
  reopenTodo,
  saveTodos,
  sortTodos,
} from "./lib/todos";
import type {
  CompletionInput,
  Todo,
  TodoFilter,
  TodoInput,
} from "./types";

type DialogState =
  | { type: "create" }
  | { type: "complete"; todo: Todo }
  | { type: "notes"; todo: Todo }
  | null;

const filters: Array<{ value: TodoFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "pending", label: "进行中" },
  { value: "overdue", label: "已逾期" },
  { value: "completed", label: "已完成" },
];

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState("");
  const [clock, setClock] = useState(() => new Date());

  const now = clock;
  const stats = useMemo(() => getTodoStats(todos, now), [todos, now]);
  const visibleTodos = useMemo(
    () => sortTodos(filterTodos(todos, filter, query, now)),
    [todos, filter, query, now],
  );

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timeout = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const addTodo = (input: TodoInput) => {
    const todo = createTodo(input);
    setTodos((current) => [todo, ...current]);
    setDialog(null);
    setFilter("all");
    setNotice("新的小目标已经加入计划。");
  };

  const finishTodo = (todo: Todo, input: CompletionInput) => {
    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id ? completeTodo(item, input) : item,
      ),
    );
    setDialog(null);
    setNotice(`「${todo.title}」已完成，记录已保存。`);
  };

  const updateNotes = (todo: Todo, input: CompletionInput) => {
    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id
          ? {
              ...item,
              completionNote: input.completionNote.trim(),
              problems: input.problems.trim(),
            }
          : item,
      ),
    );
    setDialog(null);
    setNotice("事项记录已更新。");
  };

  const toggleReopen = (todo: Todo) => {
    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id ? reopenTodo(item) : item,
      ),
    );
    setNotice(`「${todo.title}」已重新打开。`);
  };

  const deleteTodo = (todo: Todo) => {
    const shouldDelete = window.confirm(`确定删除「${todo.title}」吗？`);
    if (!shouldDelete) {
      return;
    }
    setTodos((current) => current.filter((item) => item.id !== todo.id));
    setNotice("事项已删除。");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="一个小目标首页">
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span>
            <strong>一个小目标</strong>
            <small>ONE SMALL GOAL</small>
          </span>
        </a>

        <div className="header-meta">
          <span>{formatToday(now)}</span>
          <button
            type="button"
            className="button button--primary header-action"
            onClick={() => setDialog({ type: "create" })}
          >
            <Icon name="plus" size={18} />
            新增目标
          </button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="kicker">MAKE IT SMALL. MAKE IT REAL.</p>
            <h1 id="hero-title">
              积小胜，
              <br />
              成大目标。
            </h1>
            <p className="hero__copy">
              写下一个清楚的目标，给它时间，也记录真实的过程。
              每一次完成，都是下一次判断的起点。
            </p>
          </div>

          <div className="hero__focus">
            <span className="hero__focus-label">当前聚焦</span>
            <strong>{stats.pending}</strong>
            <span>个进行中的目标</span>
            <button
              type="button"
              className="hero__link"
              onClick={() => setDialog({ type: "create" })}
            >
              开始一件小事
              <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>

        <div className="dashboard">
          <aside className="summary-panel" aria-label="目标概览">
            <div className="summary-panel__heading">
              <div>
                <p className="section-label">总体进度</p>
                <h2>今日概览</h2>
              </div>
              <span className="summary-panel__date">
                {stats.dueToday} 件今日截止
              </span>
            </div>

            <div className="progress-visual">
              <div
                className="progress-ring"
                style={
                  {
                    "--progress": `${stats.completionRate * 3.6}deg`,
                  } as CSSProperties
                }
                aria-label={`总体完成率 ${stats.completionRate}%`}
              >
                <div>
                  <strong>{stats.completionRate}%</strong>
                  <span>完成率</span>
                </div>
              </div>
              <p>
                {stats.total === 0
                  ? "从第一个小目标开始。"
                  : stats.completed === stats.total
                    ? "今天的计划全部完成。"
                    : `已完成 ${stats.completed} 件，继续推进剩下的 ${stats.pending} 件。`}
              </p>
            </div>

            <div className="stat-list">
              <div>
                <span className="stat-dot stat-dot--ink" />
                <span>全部事项</span>
                <strong>{stats.total}</strong>
              </div>
              <div>
                <span className="stat-dot stat-dot--amber" />
                <span>进行中</span>
                <strong>{stats.pending}</strong>
              </div>
              <div>
                <span className="stat-dot stat-dot--red" />
                <span>已逾期</span>
                <strong>{stats.overdue}</strong>
              </div>
              <div>
                <span className="stat-dot stat-dot--green" />
                <span>已完成</span>
                <strong>{stats.completed}</strong>
              </div>
            </div>

            <blockquote>
              “完成比完美更重要，记录比记忆更可靠。”
            </blockquote>
          </aside>

          <section className="goals-panel" aria-labelledby="goals-title">
            <div className="goals-panel__heading">
              <div>
                <p className="section-label">MY FOCUS</p>
                <h2 id="goals-title">我的目标</h2>
              </div>
              <label className="search-box">
                <Icon name="search" size={17} />
                <span className="sr-only">搜索事项</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索目标或记录"
                />
              </label>
            </div>

            <div className="toolbar">
              <div className="filter-tabs" aria-label="筛选事项">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={filter === item.value ? "is-active" : ""}
                    aria-pressed={filter === item.value}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="result-count">{visibleTodos.length} 项</span>
            </div>

            {visibleTodos.length > 0 ? (
              <div className="todo-grid">
                {visibleTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onComplete={() => setDialog({ type: "complete", todo })}
                    onEditNotes={() => setDialog({ type: "notes", todo })}
                    onDelete={() => deleteTodo(todo)}
                    onReopen={() => toggleReopen(todo)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__orbit" aria-hidden="true">
                  <span />
                </div>
                <p className="section-label">A FRESH START</p>
                <h3>
                  {todos.length === 0
                    ? "还没有小目标"
                    : "这里暂时没有匹配的事项"}
                </h3>
                <p>
                  {todos.length === 0
                    ? "先写下一件真正想完成的事。目标不必宏大，但要清楚。"
                    : "尝试更换筛选条件或搜索关键词。"}
                </p>
                {todos.length === 0 ? (
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setDialog({ type: "create" })}
                  >
                    <Icon name="plus" size={18} />
                    创建第一个目标
                  </button>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <span>一个小目标</span>
        <span>数据只保存在当前浏览器中</span>
      </footer>

      {notice ? (
        <div className="notice" role="status">
          <Icon name="check" size={17} />
          {notice}
        </div>
      ) : null}

      {dialog?.type === "create" ? (
        <CreateTodoDialog
          onClose={() => setDialog(null)}
          onCreate={addTodo}
        />
      ) : null}

      {dialog?.type === "complete" ? (
        <CompletionDialog
          todo={dialog.todo}
          onClose={() => setDialog(null)}
          onComplete={(input) => finishTodo(dialog.todo, input)}
        />
      ) : null}

      {dialog?.type === "notes" ? (
        <NotesDialog
          todo={dialog.todo}
          onClose={() => setDialog(null)}
          onSave={(input) => updateNotes(dialog.todo, input)}
        />
      ) : null}
    </div>
  );
}

export default App;
