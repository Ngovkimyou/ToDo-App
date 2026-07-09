import { useEffect, useState } from "react";
import { useTasks } from "../context/TaskContext";
import HomeDateStrip from "../components/HomeDateStrip";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import HomeFilterSelect from "../components/HomeFilterSelect";
import HomeTaskCard from "../components/HomeTaskCard";
import HomeTaskModal from "../components/HomeTaskModal";
import { getLocalDateKey, getTaskDueDateKey } from "../utils/date";

import "./Home.css";

function formatDateGroupTitle(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupTasksByCategory(tasks) {
  return tasks.reduce((groups, task) => {
    const category = task.category || "No category";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(task);
    return groups;
  }, {});
}

function getTaskStartMinutes(task) {
  const match = /\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/i.exec(
    task.dueDate || ""
  );

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  const normalizedHour = (hour % 12) + (period === "PM" ? 12 : 0);

  return normalizedHour * 60 + minute;
}

function sortTasksByStartTime(tasks) {
  return [...tasks].sort((firstTask, secondTask) => {
    const timeDifference =
      getTaskStartMinutes(firstTask) - getTaskStartMinutes(secondTask);

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return (firstTask.id || 0) - (secondTask.id || 0);
  });
}

function Home() {
  const { tasks, editTask, deleteTask, toggleComplete } = useTasks();
  const [displayAllTasks, setDisplayAllTasks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey(new Date()));
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskMode, setSelectedTaskMode] = useState("view");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    if (task.inRecyclingBin) {
      return false;
    }

    const taskDateKey = getTaskDueDateKey(task);
    const isSelectedDate = displayAllTasks || taskDateKey === selectedDate;
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
  const sortedTasks = sortTasksByStartTime(filteredTasks);
  const taskGroups = Object.entries(groupTasksByCategory(sortedTasks));
  const dateGroups = Object.entries(
    sortedTasks.reduce((groups, task) => {
      const dateKey = getTaskDueDateKey(task);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(task);
      return groups;
    }, {})
  ).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate));

  function renderTaskCard(category, categoryTasks, keyPrefix = "") {
    return (
      <HomeTaskCard
        key={`${keyPrefix}${category}`}
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
        onCategoryDelete={setCategoryToDelete}
        onCategoryComplete={({ tasks: completedTasks }) => {
          completedTasks.forEach((task) => {
            editTask(task.id, {
              inRecyclingBin: true,
              recycledAt: new Date().toISOString(),
            });
          });
        }}
      />
    );
  }

  useEffect(() => {
    const panel = document.querySelector(".app-panel-home");

    if (!panel || (!selectedTask && !taskToDelete && !categoryToDelete)) {
      return undefined;
    }

    const previousOverflowY = panel.style.overflowY;
    panel.style.overflowY = "hidden";

    return () => {
      panel.style.overflowY = previousOverflowY;
    };
  }, [selectedTask, taskToDelete, categoryToDelete]);

  return (
    <div className="home-page">
      <h1 className="page-title">Home</h1>
      <HomeDateStrip onDateChange={setSelectedDate} />

      <section className="home-task-controls" aria-label="Filter tasks">
        <label className="display-all-toggle">
          <span>Display All</span>
          <input
            type="checkbox"
            checked={displayAllTasks}
            onChange={(event) => setDisplayAllTasks(event.target.checked)}
          />
          <span className="display-all-switch" aria-hidden="true">
            <span />
          </span>
        </label>

        <HomeFilterSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
        />

        <label>
          <span>Search</span>
          <input
            type="search"
            value={searchQuery}
            maxLength={100}
            placeholder="Search tasks"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </section>

      <section className="home-task-list" aria-label="Tasks">
        {displayAllTasks
          ? dateGroups.map(([dateKey, dateTasks]) => (
              <section className="home-date-task-group" key={dateKey}>
                <h2 className="home-date-task-title">
                  {formatDateGroupTitle(dateKey)}
                </h2>

                <div className="home-date-task-list">
                  {Object.entries(groupTasksByCategory(dateTasks)).map(
                    ([category, categoryTasks]) =>
                      renderTaskCard(category, categoryTasks, `${dateKey}-`)
                  )}
                </div>
              </section>
            ))
          : taskGroups.map(([category, categoryTasks]) =>
              renderTaskCard(category, categoryTasks)
            )}
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
        item={taskToDelete}
        title="Delete Task?"
        message={
          taskToDelete
            ? `This will permanently delete "${taskToDelete.title}" and its related content.`
            : ""
        }
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          deleteTask(taskToDelete.id);
          setTaskToDelete(null);
          setSelectedTask((currentTask) =>
            currentTask?.id === taskToDelete.id ? null : currentTask
          );
        }}
      />

      <HomeDeleteConfirm
        item={categoryToDelete}
        title="Delete Category Tasks?"
        message={
          categoryToDelete
            ? `This will permanently delete all tasks inside "${categoryToDelete.category}".`
            : ""
        }
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => {
          categoryToDelete.tasks.forEach((task) => deleteTask(task.id));
          setCategoryToDelete(null);
          setSelectedTask((currentTask) =>
            categoryToDelete.tasks.some((task) => task.id === currentTask?.id)
              ? null
              : currentTask
          );
        }}
      />
    </div>
  );
}

export default Home;
