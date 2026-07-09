import { useEffect, useState } from "react";
import checklistIcon from "../assets/black-CheckList-icon.avif";
import completedIcon from "../assets/green-checkmark-icon.avif";
import menuIcon from "../assets/3dots-icon.avif";
import editIcon from "../assets/edit-icon.avif";
import whiteEditIcon from "../assets/white-edit-icon.avif";
import blackRecyclingIcon from "../assets/black-RecyclingBin-icon.avif";
import recyclingIcon from "../assets/RecyclingBin-icon.avif";

function HomeTaskCard({
  category,
  tasks,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskToggleComplete,
}) {
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  useEffect(() => {
    function closeMenu() {
      setOpenMenuTaskId(null);
    }

    document.addEventListener("pointerdown", closeMenu);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
    };
  }, []);

  return (
    <article className="home-task-folder">
      <div className="task-folder-header">
        <div className="task-folder-tab">{category}</div>

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

      <div className="task-folder-body">
        {tasks.map((task) => (
          <div
            className="task-folder-item"
            key={task.id}
            role="button"
            tabIndex={0}
            onClick={() => onTaskSelect(task)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
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
                  task.completed ? "Mark task incomplete" : "Mark task complete"
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
                onClick={() => {
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
                  onClick={() => {
                    setOpenMenuTaskId(null);
                    onTaskEdit(task);
                }}
              >
                <img className="action-icon-default" src={whiteEditIcon} alt="" />
                <img className="action-icon-hover" src={editIcon} alt="" />
              </button>

              <button
                className="task-menu-action is-danger"
                type="button"
                aria-label="Delete task"
                  onClick={() => {
                    setOpenMenuTaskId(null);
                    onTaskDelete(task);
                }}
              >
                <img className="action-icon-default" src={recyclingIcon} alt="" />
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
      </div>
    </article>
  );
}

export default HomeTaskCard;
