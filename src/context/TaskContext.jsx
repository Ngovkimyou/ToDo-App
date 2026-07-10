import { useEffect, useState } from "react";
import { TaskContext } from "./task-context";

const TASKS_STORAGE_KEY = "todo-app-tasks";
const DELETED_TASKS_STORAGE_KEY = "todo-app-deleted-tasks";

//================ Local Storage Helpers ================
function readStoredTasks(storageKey) {
  try {
    const storedValue = localStorage.getItem(storageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => readStoredTasks(TASKS_STORAGE_KEY));
  const [deletedTasks, setDeletedTasks] = useState(() =>
    readStoredTasks(DELETED_TASKS_STORAGE_KEY)
  );

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      DELETED_TASKS_STORAGE_KEY,
      JSON.stringify(deletedTasks)
    );
  }, [deletedTasks]);

  //================ Active Task Actions ================
  function addTask(task) {
    setTasks((currentTasks) => [...currentTasks, task]);
  }

  function deleteTask(id) {
    const taskToDelete = tasks.find((task) => task.id === id);

    if (!taskToDelete) {
      return;
    }

    const recycledTask = {
      ...taskToDelete,
      recycledAt: new Date().toISOString(),
    };

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
    setDeletedTasks((currentDeletedTasks) => {
      if (currentDeletedTasks.some((task) => task.id === id)) {
        return currentDeletedTasks;
      }

      return [...currentDeletedTasks, recycledTask];
    });
  }

  function restoreTask(id) {
    const taskToRestore = deletedTasks.find((task) => task.id === id);

    if (!taskToRestore) {
      return;
    }

    setDeletedTasks((currentDeletedTasks) =>
      currentDeletedTasks.filter((task) => task.id !== id)
    );
    setTasks((currentTasks) => {
      if (currentTasks.some((task) => task.id === id)) {
        return currentTasks;
      }

      return [...currentTasks, taskToRestore];
    });
  }

  function deleteTaskForever(id) {
    setDeletedTasks((currentDeletedTasks) =>
      currentDeletedTasks.filter((task) => task.id !== id)
    );
  }

  function restoreTasks(ids) {
    const idSet = new Set(ids);
    const tasksToRestore = deletedTasks.filter((task) => idSet.has(task.id));

    setDeletedTasks((currentDeletedTasks) =>
      currentDeletedTasks.filter((task) => !idSet.has(task.id))
    );
    setTasks((currentTasks) => {
      const currentIds = new Set(currentTasks.map((task) => task.id));
      const newTasks = tasksToRestore.filter(
        (task) => !currentIds.has(task.id)
      );

      return [...currentTasks, ...newTasks];
    });
  }

  function deleteTasksForever(ids) {
    const idSet = new Set(ids);
    setDeletedTasks((currentDeletedTasks) =>
      currentDeletedTasks.filter((task) => !idSet.has(task.id))
    );
  }

  function toggleComplete(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function editTask(id, updatedTask) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, ...updatedTask }
          : task
      )
    );
  }

  // Keep old duplicated deleted tasks from rendering if localStorage already has them.
  const uniqueDeletedTasks = deletedTasks.filter(
    (task, index, currentDeletedTasks) =>
      currentDeletedTasks.findIndex(
        (currentTask) => currentTask.id === task.id
      ) === index
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        deletedTasks: uniqueDeletedTasks,
        addTask,
        deleteTask,
        restoreTask,
        deleteTaskForever,
        restoreTasks,
        deleteTasksForever,
        toggleComplete,
        editTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
