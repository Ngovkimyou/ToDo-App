import checklistIcon from "../assets/black-CheckList-icon.avif";
import completedIcon from "../assets/green-checkmark-icon.avif";
import blackRecyclingIcon from "../assets/black-RecyclingBin-icon.avif";
import recyclingIcon from "../assets/RecyclingBin-icon.avif";

function BinTaskCard({ category, tasks, onTaskRestore, onTaskDelete }) {
  return (
    <article className="home-task-folder">
      <div className="task-folder-header">
        <div className="task-folder-tab">{category}</div>
      </div>

      <div className="task-folder-body">
        {tasks.map((task) => (
          <div className="task-folder-item" key={task.id}>
            <div className="task-folder-main">
              <span
                className={`task-folder-icon ${
                  task.completed ? "is-completed" : ""
                }`}
              >
                <img
                  src={task.completed ? completedIcon : checklistIcon}
                  alt=""
                />
              </span>

              <div className="task-folder-info">
                <h2>{task.title}</h2>
                <p>{task.description || "No description"}</p>
              </div>
            </div>

            <div className="bin-item-actions">
              <button
                className="task-menu-action is-restore"
                type="button"
                aria-label="Restore task"
                onClick={() => onTaskRestore(task)}
              >
                ↺
              </button>

              <button
                className="task-menu-action is-danger"
                type="button"
                aria-label="Delete task forever"
                onClick={() => onTaskDelete(task)}
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
        ))}
      </div>
    </article>
  );
}

export default BinTaskCard;
