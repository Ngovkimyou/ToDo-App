import { createPortal } from "react-dom";

function HomeDeleteConfirm({
  task,
  open,
  heading,
  confirmVariant,
  onCancel,
  onConfirm,
}) {
  const isOpen = open !== undefined ? open : Boolean(task);

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
        <h2 id="delete-confirm-title">{heading || "Delete Task?"}</h2>
        {/* <p>
          {message || (
            <>
              This will move <strong>{task.title}</strong> to the Recycling
              Bin.
            </>
          )}
        </p> */}

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
