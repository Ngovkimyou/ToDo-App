import { useState } from "react";
import { useTasks } from "../context/TaskContext";
import BinTaskCard from "../components/BinTaskCard";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import { groupTasksByCategory } from "../utils/tasks";

import "./RecyclingBin.css";

function RecyclingBin() {
  const { deletedTasks, restoreTask, deleteTaskForever } = useTasks();
  const [taskToDelete, setTaskToDelete] = useState(null);

  const taskGroups = Object.entries(groupTasksByCategory(deletedTasks));

  return (
    <div className="bin-page">
      <h1 className="page-title">Recycling Bin</h1>

      {taskGroups.length === 0 ? (
        <p className="bin-empty">The recycling bin is empty.</p>
      ) : (
        <section className="bin-task-list" aria-label="Deleted tasks">
          {taskGroups.map(([category, categoryTasks]) => (
            <BinTaskCard
              key={category}
              category={category}
              tasks={categoryTasks}
              onTaskRestore={(task) => restoreTask(task.id)}
              onTaskDelete={setTaskToDelete}
            />
          ))}
        </section>
      )}

      <HomeDeleteConfirm
        task={taskToDelete}
        heading="Delete Forever?"
        message="This will permanently remove the task. Proceed?"
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          deleteTaskForever(taskToDelete.id);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
}

export default RecyclingBin;
