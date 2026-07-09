import { createContext, useContext, useState } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);

  function addTask(task) {
    setTasks((currentTasks) => [...currentTasks, task]);
  }

  function deleteTask(id) {
    setTasks((currentTasks) => {
      const taskToDelete = currentTasks.find((task) => task.id === id);

      if (!taskToDelete) {
        return currentTasks;
      }

      setDeletedTasks((currentDeletedTasks) => [
        ...currentDeletedTasks,
        {
          ...taskToDelete,
          recycledAt: new Date().toISOString(),
        },
      ]);

      return currentTasks.filter((task) => task.id !== id);
    });
  }

  function restoreTask(id) {
    setDeletedTasks((currentDeletedTasks) => {
      const taskToRestore = currentDeletedTasks.find((task) => task.id === id);

      if (!taskToRestore) {
        return currentDeletedTasks;
      }

      setTasks((currentTasks) => [...currentTasks, taskToRestore]);
      return currentDeletedTasks.filter((task) => task.id !== id);
    });
  }

  function deleteTaskForever(id) {
    setDeletedTasks((currentDeletedTasks) =>
      currentDeletedTasks.filter((task) => task.id !== id)
    );
  }

  function restoreTasks(ids) {
    const idSet = new Set(ids);
    setDeletedTasks((currentDeletedTasks) => {
      const tasksToRestore = currentDeletedTasks.filter((task) =>
        idSet.has(task.id)
      );

      setTasks((currentTasks) => [...currentTasks, ...tasksToRestore]);
      return currentDeletedTasks.filter((task) => !idSet.has(task.id));
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

  return (
    <TaskContext.Provider
      value={{
        tasks,
        deletedTasks,
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
