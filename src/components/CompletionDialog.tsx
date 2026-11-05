import { useState, type FormEvent } from "react";
import type { CompletionInput, Todo } from "../types";
import { Modal } from "./Modal";

interface CompletionDialogProps {
  todo: Todo;
  onClose: () => void;
  onComplete: (input: CompletionInput) => void;
}

export function CompletionDialog({
  todo,
  onClose,
  onComplete,
}: CompletionDialogProps) {
  const [completionNote, setCompletionNote] = useState(todo.completionNote);
  const [problems, setProblems] = useState(todo.problems);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete({ completionNote, problems });
  };

  return (
    <Modal
      title={`完成「${todo.title}」`}
      description="记录结果和阻碍，让这次完成成为下一次判断的依据。"
      onClose={onClose}
      size="wide"
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="completion-summary">
          <span>目标</span>
          <p>{todo.goal}</p>
        </div>

        <div className="field">
          <label htmlFor="completion-note">完成情况</label>
          <textarea
            id="completion-note"
            autoFocus
            value={completionNote}
            maxLength={600}
            rows={4}
            onChange={(event) => setCompletionNote(event.target.value)}
            placeholder="实际完成了什么？和原目标相比结果如何？"
          />
        </div>

        <div className="field">
          <label htmlFor="completion-problems">遇到的问题</label>
          <textarea
            id="completion-problems"
            value={problems}
            maxLength={600}
            rows={3}
            onChange={(event) => setProblems(event.target.value)}
            placeholder="有哪些阻碍、偏差点或值得下次注意的地方？"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            再等等
          </button>
          <button type="submit" className="button button--primary">
            确认完成
          </button>
        </div>
      </form>
    </Modal>
  );
}
