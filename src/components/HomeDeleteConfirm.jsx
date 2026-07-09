import { createPortal } from "react-dom";

function HomeDeleteConfirm({
  item,
  task,
  open,
  title,
  heading,
  message,
  confirmVariant,
  onCancel,
  onConfirm,
}) {
  const confirmItem = item || task;
  const isOpen = open !== undefined ? open : Boolean(confirmItem);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="task-modal-overlay" onClick={onCancel}>
      <article
        className="delete-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-confirm-title">
          {heading || title || "Delete Task?"}
        </h2>
        {message && <p>{message}</p>}

        <div className="task-modal-actions">
          <button
            className="task-modal-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`task-modal-close ${
              confirmVariant === "neutral" ? "" : "is-danger"
            }`}
            type="button"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </article>
    </div>,
    document.body,
  );
}

export default HomeDeleteConfirm;
