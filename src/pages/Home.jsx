import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTasks } from "../context/TaskContext";
import HomeDateStrip from "../components/HomeDateStrip";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import HomeFilterSelect from "../components/HomeFilterSelect";
import HomeTaskCard from "../components/HomeTaskCard";
import HomeTaskModal from "../components/HomeTaskModal";
import emptyItemIcon from "../assets/empty-item.avif";
import { getLocalDateKey, getTaskDueDateKey } from "../utils/date";
import { groupTasksByCategory } from "../utils/tasks";

import "./Home.css";

function formatDateGroupTitle(dateKey) {
  const [year, month, day] = dateKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDateKeyFromDateTime(dateTime) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(dateTime || "");

  if (!match) {
    return null;
  }

  const day = String(match[1]).padStart(2, "0");
  const month = String(match[2]).padStart(2, "0");
  const year = match[3];

  return `${year}-${month}-${day}`;
}

function formatDateRangeTitle(dateKey, dateTasks) {
  const startTitle = formatDateGroupTitle(dateKey);
  const hasOpenEndedTask = dateTasks.some((task) => !task.endDate);

  if (hasOpenEndedTask) {
    return `${startTitle} --- Onward`;
  }

  const latestEndDateKey = dateTasks
    .map((task) => getDateKeyFromDateTime(task.endDate))
    .filter(Boolean)
    .sort()
    .at(-1);

  return `${startTitle} --- ${
    latestEndDateKey ? formatDateGroupTitle(latestEndDateKey) : "Onward"
  }`;
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
  const location = useLocation();
  const { tasks, editTask, deleteTask, toggleComplete } = useTasks();
  const [displayAllTasks, setDisplayAllTasks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate || getLocalDateKey(new Date())
  );
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskMode, setSelectedTaskMode] = useState("view");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const trimmedSearchQuery = searchQuery.trim();
  const emptySearchLabel =
    trimmedSearchQuery.length > 10
      ? `${trimmedSearchQuery.slice(0, 10)}...`
      : trimmedSearchQuery;
  const hasAnyTasks = tasks.length > 0;
  const filteredTasks = tasks.filter((task) => {
    const taskDateKey = getTaskDueDateKey(task);
    const isSelectedDate = displayAllTasks || taskDateKey === selectedDate;
    const isSelectedCategory =
      selectedCategory === "All" || task.category === selectedCategory;
    const searchableText = [task.title, task.description, task.category]
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !normalizedSearchQuery ||
      searchableText.includes(normalizedSearchQuery);

    return isSelectedDate && isSelectedCategory && matchesSearch;
  });
  const sortedTasks = sortTasksByStartTime(filteredTasks);
  const hasVisibleTasks = sortedTasks.length > 0;
  const emptyStateMessage = normalizedSearchQuery
    ? `No tasks found for "${emptySearchLabel}"`
    : selectedCategory !== "All"
      ? `No tasks found in ${selectedCategory}`
      : hasAnyTasks
        ? "No tasks scheduled for this day..."
        : "No tasks have been created yet...";
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

  function moveTaskToRecyclingBin(task) {
    deleteTask(task.id);
    setSelectedTask((currentTask) =>
      currentTask?.id === task.id ? null : currentTask
    );
  }

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
          completedTasks.forEach(moveTaskToRecyclingBin);
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
      <HomeDateStrip
        selectedDateKey={selectedDate}
        onDateChange={setSelectedDate}
      />

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
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </section>

      <section className="home-task-list" aria-label="Tasks">
        {!hasVisibleTasks ? (
          <div className="home-empty-state">
            <img src={emptyItemIcon} alt="" />
            <p>{emptyStateMessage}</p>
          </div>
        ) : displayAllTasks ? (
          dateGroups.map(([dateKey, dateTasks]) => (
            <section className="home-date-task-group" key={dateKey}>
              <h2 className="home-date-task-title">
                {formatDateRangeTitle(dateKey, dateTasks)}
              </h2>

              <div className="home-date-task-list">
                {Object.entries(groupTasksByCategory(dateTasks)).map(
                  ([category, categoryTasks]) =>
                    renderTaskCard(category, categoryTasks, `${dateKey}-`)
                )}
              </div>
            </section>
          ))
        ) : (
          taskGroups.map(([category, categoryTasks]) =>
            renderTaskCard(category, categoryTasks)
          )
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
        title="Move Task to Recycling Bin?"
        message={
          taskToDelete
            ? `This will move "${taskToDelete.title}" and its related content to the Recycling Bin.`
            : ""
        }
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          moveTaskToRecyclingBin(taskToDelete);
          setTaskToDelete(null);
        }}
      />

      <HomeDeleteConfirm
        item={categoryToDelete}
        title="Move Category Tasks to Recycling Bin?"
        message={
          categoryToDelete
            ? `This will move all tasks inside "${categoryToDelete.category}" to the Recycling Bin.`
            : ""
        }
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => {
          categoryToDelete.tasks.forEach(moveTaskToRecyclingBin);
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
