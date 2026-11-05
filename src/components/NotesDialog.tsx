import { useState, type FormEvent } from "react";
import type { CompletionInput, Todo } from "../types";
import { Modal } from "./Modal";

interface NotesDialogProps {
  todo: Todo;
  onClose: () => void;
  onSave: (input: CompletionInput) => void;
}

export function NotesDialog({ todo, onClose, onSave }: NotesDialogProps) {
  const [completionNote, setCompletionNote] = useState(todo.completionNote);
  const [problems, setProblems] = useState(todo.problems);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ completionNote, problems });
  };

  return (
    <Modal
      title={todo.status === "completed" ? "修改完成记录" : "记录进展与问题"}
      description={todo.goal}
      onClose={onClose}
      size="wide"
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="notes-completion">完成情况 / 当前进展</label>
          <textarea
            id="notes-completion"
            autoFocus
            value={completionNote}
            maxLength={600}
            rows={4}
            onChange={(event) => setCompletionNote(event.target.value)}
            placeholder="已经完成了哪些部分？"
          />
        </div>

        <div className="field">
          <label htmlFor="notes-problems">遇到的问题</label>
          <textarea
            id="notes-problems"
            value={problems}
            maxLength={600}
            rows={3}
            onChange={(event) => setProblems(event.target.value)}
            placeholder="遇到了什么阻碍？"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="button button--primary">
            保存记录
          </button>
        </div>
      </form>
    </Modal>
  );
}
