import { createPortal } from "react-dom";

function KeyboardHelpModal({ open, onClose }) {
  if (!open) {
    return null;
  }

  //================ Keyboard Tutorial Modal ================
  return createPortal(
    <div className="task-modal-overlay" onClick={onClose}>
      <article
        className="delete-confirm-modal keyboard-help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="keyboard-help-title">Keyboard Support</h2>

        <div className="keyboard-help-list">
          <p>
            <span id="up-down">Up / Down:</span> move between inputs and sections.
          </p>
          <p>
            <span id="enter-space">Enter / Space:</span> open selections, toggle ending date,
            or choose an option.
          </p>
          <p>
            <span id="left-right">Left / Right:</span> move across date and time fields.
          </p>
          <p>
            <span id="esc">Esc:</span> close an open selection menu.
          </p>
        </div>

        <button className="task-modal-close" type="button" onClick={onClose}>
          Close
        </button>
      </article>
    </div>,
    document.body,
  );
}

export default KeyboardHelpModal;
