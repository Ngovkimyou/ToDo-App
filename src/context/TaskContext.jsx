import { createContext, useContext, useState } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);

  function addTask(task) {
    setTasks([...tasks, task]);
  }

  function deleteTask(id) {
    const taskToDelete = tasks.find((task) => task.id === id);

    if (!taskToDelete) {
      return;
    }

    setTasks(tasks.filter((task) => task.id !== id));
    setDeletedTasks([...deletedTasks, taskToDelete]);
  }

  function restoreTask(id) {
    const taskToRestore = deletedTasks.find((task) => task.id === id);

    if (!taskToRestore) {
      return;
    }

    setDeletedTasks(deletedTasks.filter((task) => task.id !== id));
    setTasks([...tasks, taskToRestore]);
  }

  function deleteTaskForever(id) {
    setDeletedTasks(deletedTasks.filter((task) => task.id !== id));
  }

  function restoreTasks(ids) {
    const idSet = new Set(ids);
    const tasksToRestore = deletedTasks.filter((task) => idSet.has(task.id));

    setDeletedTasks(deletedTasks.filter((task) => !idSet.has(task.id)));
    setTasks([...tasks, ...tasksToRestore]);
  }

  function deleteTasksForever(ids) {
    const idSet = new Set(ids);
    setDeletedTasks(deletedTasks.filter((task) => !idSet.has(task.id)));
  }

  function toggleComplete(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function editTask(id, updatedTask) {
    setTasks(
      tasks.map((task) =>
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
