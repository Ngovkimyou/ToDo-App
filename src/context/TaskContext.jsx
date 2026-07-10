import { createContext, useContext, useState } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);

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

export function useTasks() {
  return useContext(TaskContext);
}
