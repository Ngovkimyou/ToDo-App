import { useEffect, useState } from "react";
import { useTasks } from "../context/TaskContext";
import HomeDateStrip from "../components/HomeDateStrip";
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

    if (!panel || !selectedTask) {
      return undefined;
    }

    const previousOverflowY = panel.style.overflowY;
    panel.style.overflowY = "hidden";

    return () => {
      panel.style.overflowY = previousOverflowY;
    };
  }, [selectedTask]);

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
            onTaskDelete={(task) => {
              deleteTask(task.id);
              setSelectedTask((currentTask) =>
                currentTask?.id === task.id ? null : currentTask
              );
            }}
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
    </div>
  );
}

export default Home;
