import { useEffect, useState } from "react";
import { useTasks } from "../context/TaskContext";
import HomeDateStrip from "../components/HomeDateStrip";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import HomeFilterSelect from "../components/HomeFilterSelect";
import HomeTaskCard from "../components/HomeTaskCard";
import HomeTaskModal from "../components/HomeTaskModal";
import { getLocalDateKey, getTaskCreatedDateKey } from "../utils/date";
import { groupTasksByCategory } from "../utils/tasks";

import "./Home.css";

function Home() {
  const { tasks, editTask, deleteTask, toggleComplete } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey(new Date()));
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskMode, setSelectedTaskMode] = useState("view");
  const [taskToDelete, setTaskToDelete] = useState(null);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const isSelectedDate = getTaskCreatedDateKey(task) === selectedDate;
    const isSelectedCategory =
      selectedCategory === "All" || task.category === selectedCategory;
    const searchableText = [
      task.title,
      task.description,
      task.category,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !normalizedSearchQuery ||
      searchableText.includes(normalizedSearchQuery);

    return isSelectedDate && isSelectedCategory && matchesSearch;
  });
  const taskGroups = Object.entries(groupTasksByCategory(filteredTasks));

  useEffect(() => {
    const panel = document.querySelector(".app-panel-home");

    if (!panel || (!selectedTask && !taskToDelete)) {
      return undefined;
    }

    const previousOverflowY = panel.style.overflowY;
    panel.style.overflowY = "hidden";

    return () => {
      panel.style.overflowY = previousOverflowY;
    };
  }, [selectedTask, taskToDelete]);

  return (
    <div className="home-page">
      <h1 className="page-title">Home</h1>
      <HomeDateStrip onDateChange={setSelectedDate} />

      <section className="home-task-controls" aria-label="Filter tasks">
        <HomeFilterSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
        />

        <label>
          <span>Search</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Search tasks"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </section>

      <section className="home-task-list" aria-label="Tasks">
        {taskGroups.map(([category, categoryTasks]) => (
          <HomeTaskCard
            key={category}
            category={category}
            tasks={categoryTasks}
            onTaskSelect={(task) => {
              setSelectedTaskMode("view");
              setSelectedTask(task);
            }}
            onTaskEdit={(task) => {
              setSelectedTaskMode("edit");
              setSelectedTask(task);
            }}
            onTaskDelete={setTaskToDelete}
            onTaskToggleComplete={toggleComplete}
          />
        ))}
      </section>

      <HomeTaskModal
        task={selectedTask}
        startInEditMode={selectedTaskMode === "edit"}
        onSave={(taskId, updatedTask) => {
          editTask(taskId, updatedTask);
          setSelectedTask((currentTask) => ({
            ...currentTask,
            ...updatedTask,
          }));
        }}
        onClose={() => setSelectedTask(null)}
      />

      <HomeDeleteConfirm
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          deleteTask(taskToDelete.id);
          setTaskToDelete(null);
          setSelectedTask((currentTask) =>
            currentTask?.id === taskToDelete.id ? null : currentTask
          );
        }}
      />
    </div>
  );
}

export default Home;
