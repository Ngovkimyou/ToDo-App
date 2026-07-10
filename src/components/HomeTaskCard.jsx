import { useEffect, useState } from "react";
import checklistIcon from "../assets/black-CheckList-icon.avif";
import completedIcon from "../assets/green-checkmark-icon.avif";
import menuIcon from "../assets/3dots-icon.avif";
import editIcon from "../assets/edit-icon.avif";
import whiteEditIcon from "../assets/white-edit-icon.avif";
import blackRecyclingIcon from "../assets/black-RecyclingBin-icon.avif";
import recyclingIcon from "../assets/RecyclingBin-icon.avif";
import { CATEGORY_OPTIONS } from "../utils/taskForm";

const PROMPT_CLOSE_DURATION = 260;

//================ Category Icon Lookup ================
const categoryIconByValue = CATEGORY_OPTIONS.reduce((icons, option) => {
  icons[option.value] = option.icon;
  return icons;
}, {});

//================ Time Rail Helpers ================
function getTaskStartLabel(dueDate) {
  const timeMatch = dueDate?.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/i);

  if (!timeMatch) {
    return "Anytime";
  }

  return `${Number(timeMatch[1])}:${timeMatch[2]} ${timeMatch[3].toUpperCase()}`;
}

function getTaskEndLabel(endDate) {
  return endDate ? getTaskStartLabel(endDate) : "Onward";
}

function HomeTaskCard({
  category,
  tasks,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskToggleComplete,
  onCategoryDelete,
  onCategoryComplete,
}) {
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);
  const [isPromptClosing, setIsPromptClosing] = useState(false);
  const [recyclingCountdown, setRecyclingCountdown] = useState(null);
  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const isCategoryComplete = progressPercent === 100;
  const isCountdownActive = recyclingCountdown !== null;
  const isRemovingCategory = isPromptClosing && recyclingCountdown === 0;
  const categoryIcon = categoryIconByValue[category];

  //================ Task Menu Lifecycle ================
  useEffect(() => {
    function closeMenu() {
      setOpenMenuTaskId(null);
    }

    document.addEventListener("pointerdown", closeMenu);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
    };
  }, []);

  useEffect(() => {
    if (isCountdownActive) {
      // Close task menus while the category completion countdown is running.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenMenuTaskId(null);
    }
  }, [isCountdownActive]);

  //================ Completion Prompt Lifecycle ================
  useEffect(() => {
    if (isCategoryComplete) {
      // The prompt is an animation state derived from category completion.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCompletePrompt(true);
      setIsPromptClosing(false);
      return undefined;
    }

    if (!showCompletePrompt) {
      return undefined;
    }

    setIsPromptClosing(true);

    const timerId = window.setTimeout(() => {
      setShowCompletePrompt(false);
      setIsPromptClosing(false);
      setRecyclingCountdown(null);
    }, PROMPT_CLOSE_DURATION);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isCategoryComplete, showCompletePrompt]);

  useEffect(() => {
    if (!showCompletePrompt || !isCategoryComplete || isPromptClosing) {
      return undefined;
    }

    if (recyclingCountdown === null) {
      return undefined;
    }

    if (recyclingCountdown === 0) {
      // Start the exit animation before moving the category to the bin.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPromptClosing(true);

      window.setTimeout(() => {
        onCategoryComplete({ category, tasks });
      }, PROMPT_CLOSE_DURATION);

      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setRecyclingCountdown((currentCountdown) =>
        currentCountdown === null ? null : currentCountdown - 1
      );
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    category,
    isCategoryComplete,
    isPromptClosing,
    onCategoryComplete,
    recyclingCountdown,
    showCompletePrompt,
    tasks,
  ]);

  return (
    <article
      className={`home-task-folder ${
        isRemovingCategory ? "is-removing" : ""
      }`}
    >
      <div className="task-folder-header">
        <div className="task-folder-tab">
          <span className="task-folder-tab-label">
            {categoryIcon && <img src={categoryIcon} alt="" />}
            <span>{category}</span>
          </span>
          <button
            className="task-folder-tab-delete"
            type="button"
            aria-label={`Delete ${category} category tasks`}
            disabled={isCountdownActive}
            onClick={() => onCategoryDelete({ category, tasks })}
          >
            x
          </button>
        </div>

        <div className="task-progress">
          <span className="task-progress-track">
            <span
              className={`task-progress-fill ${
                progressPercent === 100 ? "is-complete" : ""
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </span>
          <span
            className={`task-progress-text ${
              progressPercent === 100 ? "is-complete" : ""
            }`}
          >
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="task-folder-content">
        <div className="task-time-column" aria-hidden="true">
          {tasks.map((task) => (
            <div className="task-time-rail" key={task.id}>
              <span className="task-time-label">
                {getTaskStartLabel(task.dueDate)}
              </span>
              <span className="task-time-line" />
              <span className="task-time-label">
                {getTaskEndLabel(task.endDate)}
              </span>
            </div>
          ))}
        </div>

        <div className="task-folder-body">
          {tasks.map((task) => (
            <div
              className={`task-folder-item ${
                isCountdownActive ? "is-countdown-locked" : ""
              }`}
              key={task.id}
              role="button"
              tabIndex={isCountdownActive ? -1 : 0}
              aria-disabled={isCountdownActive}
              onClick={() => {
                if (isCountdownActive) {
                  onTaskToggleComplete(task.id);
                  return;
                }

                onTaskSelect(task);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();

                  if (isCountdownActive) {
                    onTaskToggleComplete(task.id);
                    return;
                  }

                  onTaskSelect(task);
                }
              }}
            >
              <div className="task-folder-main">
                <button
                  className={`task-folder-icon ${
                    task.completed ? "is-completed" : ""
                  }`}
                  type="button"
                  aria-label={
                    task.completed
                      ? "Mark task incomplete"
                      : "Mark task complete"
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onTaskToggleComplete(task.id);
                  }}
                >
                  <img
                    src={task.completed ? completedIcon : checklistIcon}
                    alt=""
                  />
                </button>

                <div className="task-folder-info">
                  <h2>{task.title}</h2>
                  <p>{task.description || "No description"}</p>
                </div>
              </div>

              <div
                className="task-menu-wrap"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <button
                  className="task-menu-button"
                  type="button"
                  aria-label="Task menu"
                  disabled={isCountdownActive}
                  onClick={() => {
                    if (isCountdownActive) {
                      return;
                    }

                    setOpenMenuTaskId((currentTaskId) =>
                      currentTaskId === task.id ? null : task.id
                    );
                  }}
                >
                  <img src={menuIcon} alt="" />
                </button>

                <div
                  className={`task-menu-actions ${
                    openMenuTaskId === task.id ? "is-open" : ""
                  }`}
                  aria-hidden={openMenuTaskId !== task.id}
                >
                  <button
                    className="task-menu-action"
                    type="button"
                    aria-label="Edit task"
                    disabled={isCountdownActive}
                    onClick={() => {
                      setOpenMenuTaskId(null);
                      onTaskEdit(task);
                    }}
                  >
                    <img
                      className="action-icon-default"
                      src={whiteEditIcon}
                      alt=""
                    />
                    <img className="action-icon-hover" src={editIcon} alt="" />
                  </button>

                  <button
                    className="task-menu-action is-danger"
                    type="button"
                    aria-label="Delete task"
                    disabled={isCountdownActive}
                    onClick={() => {
                      setOpenMenuTaskId(null);
                      onTaskDelete(task);
                    }}
                  >
                    <img
                      className="action-icon-default"
                      src={recyclingIcon}
                      alt=""
                    />
                    <img
                      className="action-icon-hover"
                      src={blackRecyclingIcon}
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {showCompletePrompt && (
            <div
              className={`category-complete-prompt ${
                isPromptClosing ? "is-closing" : ""
              }`}
            >
              {recyclingCountdown === null ? (
                <>
                  <p>All tasks in this category are checked.</p>
                  <button
                    type="button"
                    onClick={() => setRecyclingCountdown(7)}
                  >
                    Mark as complete
                  </button>
                </>
              ) : (
                <p>
                  This category will be removed to Recycling Bin in{" "}
                  <strong>{recyclingCountdown}s</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default HomeTaskCard;
