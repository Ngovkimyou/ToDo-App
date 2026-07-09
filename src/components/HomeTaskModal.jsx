import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CategorySelect from "./CategorySelect";
import DateTimePicker from "./DateTimePicker";
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

function parseDueDate(dueDate) {
  const match = /^(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/.exec(
    dueDate || "",
  );

  if (!match) {
    return DEFAULT_DATE_TIME;
  }

  return {
    day: match[1],
    month: match[2],
    hour: match[3].padStart(2, "0"),
    minute: match[4],
    period: match[5],
  };
}

function createDraftTask(task) {
  if (!task) {
    return {
      title: "",
      description: "",
      dueDate: "",
      category: "",
    };
  }

  return {
    ...task,
    title: task.title || "",
    description: task.description || "",
    dueDate: task.dueDate || "",
    category: task.category || "",
  };
}

function HomeTaskModal({ task, startInEditMode = false, onSave, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTask, setDraftTask] = useState(createDraftTask(task));
  const [draftDateTime, setDraftDateTime] = useState(
    parseDueDate(task?.dueDate),
  );

  useEffect(() => {
    setIsClosing(false);
    setIsEditing(startInEditMode);
    setDraftTask(createDraftTask(task));
    setDraftDateTime(parseDueDate(task?.dueDate));
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
  const fieldChanges = {
    title: draftTask.title.trim() !== task.title,
    description: draftTask.description !== (task.description || ""),
    dueDate: draftDueDate !== (task.dueDate || ""),
    category: draftTask.category !== (task.category || ""),
  };
  const hasChanges = Object.values(fieldChanges).some(Boolean);

  function handleClose() {
    setIsClosing(true);

    window.setTimeout(() => {
      onClose();
    }, CLOSE_ANIMATION_MS);
  }

  function handleCancelEdit() {
    setDraftTask(createDraftTask(task));
    setDraftDateTime(parseDueDate(task.dueDate));

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

  return createPortal(
    <div
      className={`task-modal-overlay ${isClosing ? "task-modal-closing" : ""}`}
      onClick={handleClose}
    >
      <article
        className={`task-modal ${isEditing ? "is-editing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(event) => event.stopPropagation()}
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
        </div>

        <div className="task-modal-field">
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

        <div className="task-modal-field task-modal-field-large">
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

        <div className="task-modal-field">
          <span>Date</span>
          {isEditing ? (
            <div className="task-modal-edit-field task-modal-date-field">
              <DateTimePicker
                value={draftDateTime}
                onChange={updateDraftDateTime}
              />
            </div>
          ) : (
            <p>{task.dueDate || "No date"}</p>
          )}
        </div>

        <div className="task-modal-field">
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
          <div className="task-modal-actions">
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
    </div>,
    document.body,
  );
}

export default HomeTaskModal;
