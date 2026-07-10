import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CategorySelect from "./CategorySelect";
import DateTimePicker from "./DateTimePicker";
import KeyboardHelpModal from "./KeyboardHelpModal";
import editIcon from "../assets/edit-icon.avif";
import whiteEditIcon from "../assets/white-edit-icon.avif";
import {
  DESCRIPTION_LIMIT,
  DEFAULT_DATE_TIME,
  TITLE_LIMIT,
  formatDueDate,
  getCharacterStatus,
} from "../utils/taskForm";

const CLOSE_ANIMATION_MS = 180;
const editIconElement = <img src={editIcon} alt="" />;
const headerEditIconElement = (
  <>
    <img className="action-icon-default" src={whiteEditIcon} alt="" />
    <img className="action-icon-hover" src={editIcon} alt="" />
  </>
);

//================ Modal Data Helpers ================
function parseDueDate(dueDate) {
  const match =
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/.exec(
      dueDate || "",
    );

  if (!match) {
    return DEFAULT_DATE_TIME;
  }

  return {
    day: match[1],
    month: match[2],
    year: match[3],
    hour: match[4].padStart(2, "0"),
    minute: match[5],
    period: match[6],
  };
}

function createDraftTask(task) {
  if (!task) {
    return {
      title: "",
      description: "",
      dueDate: "",
      endDate: "",
      category: "",
    };
  }

  return {
    ...task,
    title: task.title || "",
    description: task.description || "",
    dueDate: task.dueDate || "",
    endDate: task.endDate || "",
    category: task.category || "",
  };
}

function HomeTaskModal({ task, startInEditMode = false, onSave, onClose }) {
  const modalRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTask, setDraftTask] = useState(createDraftTask(task));
  const [draftDateTime, setDraftDateTime] = useState(
    parseDueDate(task?.dueDate),
  );
  const [draftEndDateTime, setDraftEndDateTime] = useState(
    parseDueDate(task?.endDate),
  );
  const [hasDraftEndDate, setHasDraftEndDate] = useState(Boolean(task?.endDate));
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);

  //================ Reset Draft When Modal Opens ================
  useEffect(() => {
    // Reset the modal draft whenever a different task is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClosing(false);
    setIsEditing(startInEditMode);
    setDraftTask(createDraftTask(task));
    setDraftDateTime(parseDueDate(task?.dueDate));
    setDraftEndDateTime(parseDueDate(task?.endDate));
    setHasDraftEndDate(Boolean(task?.endDate));
  }, [startInEditMode, task]);

  if (!task) {
    return null;
  }

  const titleStatus = getCharacterStatus(draftTask.title.length, TITLE_LIMIT);
  const descriptionStatus = getCharacterStatus(
    draftTask.description.length,
    DESCRIPTION_LIMIT,
  );
  const draftDueDate = formatDueDate(draftDateTime);
  const draftEndDate = hasDraftEndDate ? formatDueDate(draftEndDateTime) : "";

  // Only changed fields are saved so editing one input does not rewrite all data.
  const fieldChanges = {
    title: draftTask.title.trim() !== task.title,
    description: draftTask.description !== (task.description || ""),
    dueDate: draftDueDate !== (task.dueDate || ""),
    endDate: draftEndDate !== (task.endDate || ""),
    category: draftTask.category !== (task.category || ""),
  };
  const hasChanges = Object.values(fieldChanges).some(Boolean);

  function handleClose() {
    setIsClosing(true);

    window.setTimeout(() => {
      onClose();
    }, CLOSE_ANIMATION_MS);
  }

  //================ Edit Mode Actions ================
  function handleCancelEdit() {
    setDraftTask(createDraftTask(task));
    setDraftDateTime(parseDueDate(task.dueDate));
    setDraftEndDateTime(parseDueDate(task.endDate));
    setHasDraftEndDate(Boolean(task.endDate));

    if (startInEditMode) {
      handleClose();
      return;
    }

    setIsEditing(false);
  }

  function handleSaveEdit() {
    const updatedTask = {};

    if (fieldChanges.title) {
      updatedTask.title = draftTask.title.trim();
    }

    if (fieldChanges.description) {
      updatedTask.description = draftTask.description;
    }

    if (fieldChanges.dueDate) {
      updatedTask.dueDate = draftDueDate;
    }

    if (fieldChanges.endDate) {
      updatedTask.endDate = draftEndDate;
    }

    if (fieldChanges.category) {
      updatedTask.category = draftTask.category;
    }

    onSave(task.id, updatedTask);
  }

  function updateDraftTask(field, value) {
    setDraftTask((currentDraftTask) => ({
      ...currentDraftTask,
      [field]: value,
    }));
  }

  function updateDraftDateTime(field, value) {
    setDraftDateTime((currentDateTime) => ({
      ...currentDateTime,
      [field]: value,
    }));
  }

  function updateDraftEndDateTime(field, value) {
    setDraftEndDateTime((currentDateTime) => ({
      ...currentDateTime,
      [field]: value,
    }));
  }

  //================ Desktop Keyboard Navigation ================
  function isDesktopKeyboard() {
    return !window.matchMedia("(max-width: 900px)").matches;
  }

  function focusSection(sectionName) {
    if (sectionName === "end" && hasDraftEndDate) {
      focusDateInput("end");
      return;
    }

    const section = modalRef.current?.querySelector(
      `[data-keyboard-section="${sectionName}"]`
    );
    const focusableSelector =
      'input:not([type="hidden"]), textarea, button:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const focusTarget = section?.matches(focusableSelector)
      ? section
      : section?.querySelector(focusableSelector);

    focusTarget?.focus();
  }

  function focusDateInput(sectionName) {
    const dateInput = modalRef.current?.querySelector(
      `[data-keyboard-section="${sectionName}"] .date-time-picker .smart-select-input`
    );

    dateInput?.focus();
  }

  function handleModalKeyDown(event) {
    if (!isEditing || !isDesktopKeyboard()) {
      return;
    }

    if (event.target.closest(".date-time-picker")) {
      return;
    }

    const openSelect = event.target.closest(".smart-select")?.querySelector(
      ".smart-select-menu"
    );

    if (openSelect && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      return;
    }

    const currentSection = event.target.closest("[data-keyboard-section]")
      ?.dataset.keyboardSection;

    if (!currentSection) {
      return;
    }

    const sections = [
      "title",
      "description",
      "start",
      "end",
      "category",
      "actions",
    ];
    const currentIndex = sections.indexOf(currentSection);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSection(sections[Math.min(currentIndex + 1, sections.length - 1)]);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSection(sections[Math.max(currentIndex - 1, 0)]);
    }
  }

  return createPortal(
    <div
      className={`task-modal-overlay ${isClosing ? "task-modal-closing" : ""}`}
      onClick={handleClose}
    >
      <article
        ref={modalRef}
        className={`task-modal ${isEditing ? "is-editing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDownCapture={handleModalKeyDown}
      >
        <div className="task-modal-header">
          <h2 id="task-modal-title">
            {isEditing ? "Edit Task Detail" : "Task Detail"}
          </h2>

          {!isEditing && (
            <button
              className="task-modal-edit"
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
            >
              {headerEditIconElement}
            </button>
          )}

          {isEditing && (
            <button
              className="keyboard-help-button task-modal-help"
              type="button"
              aria-label="Open keyboard support tutorial"
              onClick={() => setIsKeyboardHelpOpen(true)}
            >
              ?
            </button>
          )}
        </div>

        <div className="task-modal-field" data-keyboard-section="title">
          <span>Title</span>
          {isEditing ? (
            <div className={`task-modal-edit-field ${titleStatus}`}>
              <input
                value={draftTask.title}
                maxLength={TITLE_LIMIT}
                onChange={(event) =>
                  updateDraftTask("title", event.target.value)
                }
              />
              <span className="task-modal-field-pencil">{editIconElement}</span>
              <span className="task-modal-char-counter">
                {draftTask.title.length}/{TITLE_LIMIT}
              </span>
            </div>
          ) : (
            <p>{task.title}</p>
          )}
        </div>

        <div
          className="task-modal-field task-modal-field-large"
          data-keyboard-section="description"
        >
          <span>Description</span>
          {isEditing ? (
            <div
              className={`task-modal-edit-field task-modal-edit-field-large ${descriptionStatus}`}
            >
              <textarea
                value={draftTask.description}
                maxLength={DESCRIPTION_LIMIT}
                onChange={(event) =>
                  updateDraftTask("description", event.target.value)
                }
              />
              <span className="task-modal-field-pencil">{editIconElement}</span>
              <span className="task-modal-char-counter">
                {draftTask.description.length}/{DESCRIPTION_LIMIT}
              </span>
            </div>
          ) : (
            <p>{task.description || "No description"}</p>
          )}
        </div>

        <div className="task-modal-field" data-keyboard-section="start">
          <span>Date</span>
          {isEditing ? (
            <div className="task-modal-edit-field task-modal-date-field">
              <DateTimePicker
                value={draftDateTime}
                onChange={updateDraftDateTime}
                onNavigate={(direction) =>
                  focusSection(direction === "next" ? "end" : "description")
                }
              />
            </div>
          ) : (
            <p>{task.dueDate || "No date"}</p>
          )}
        </div>

        <div className="task-modal-field" data-keyboard-section="end">
          <span>Ending Date</span>
          {isEditing ? (
            <div className="task-modal-edit-field task-modal-date-field task-modal-end-date-field">
              {hasDraftEndDate ? (
                <>
                  <DateTimePicker
                    value={draftEndDateTime}
                    onChange={updateDraftEndDateTime}
                    onNavigate={(direction) =>
                      focusSection(direction === "next" ? "category" : "start")
                    }
                  />
                  <button
                    className="task-modal-date-clear"
                    type="button"
                    onClick={() => setHasDraftEndDate(false)}
                  >
                    Set to Onward
                  </button>
                </>
              ) : (
                <button
                  className="task-modal-date-set"
                  type="button"
                  onClick={() => {
                    setHasDraftEndDate(true);
                    window.setTimeout(() => focusDateInput("end"));
                  }}
                >
                  Set ending date
                </button>
              )}
            </div>
          ) : (
            <p>{task.endDate || "Onward"}</p>
          )}
        </div>

        <div className="task-modal-field" data-keyboard-section="category">
          <span>Category</span>
          {isEditing ? (
            <div className="task-modal-edit-field task-modal-category-field">
              <CategorySelect
                value={draftTask.category}
                onChange={(nextCategory) =>
                  updateDraftTask("category", nextCategory)
                }
              />
              <span className="task-modal-field-pencil">{editIconElement}</span>
            </div>
          ) : (
            <p>{task.category || "No category"}</p>
          )}
        </div>

        {isEditing ? (
          <div className="task-modal-actions" data-keyboard-section="actions">
            <button
              className="task-modal-secondary"
              type="button"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
            <button
              className="task-modal-close"
              type="button"
              onClick={handleSaveEdit}
              disabled={!draftTask.title.trim() || !hasChanges}
            >
              Save
            </button>
          </div>
        ) : (
          <button className="task-modal-close" type="button" onClick={handleClose}>
            Close
          </button>
        )}
      </article>

      <KeyboardHelpModal
        open={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
      />
    </div>,
    document.body,
  );
}

export default HomeTaskModal;
