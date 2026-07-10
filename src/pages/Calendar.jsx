import { useEffect, useState } from "react";
import Calendar from "../components/Calendar";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import HomeTaskCard from "../components/HomeTaskCard";
import HomeTaskModal from "../components/HomeTaskModal";
import emptyItemIcon from "../assets/empty-item.avif";
import { useTasks } from "../context/useTasks";
import { getLocalDateKey, getTaskDayKey } from "../utils/date";
import { groupTasksByCategory } from "../utils/tasks";

import "./Home.css";
import "./Calendar.css";

function CalendarPage() {
  const { tasks, editTask, deleteTask, toggleComplete } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskMode, setSelectedTaskMode] = useState("view");
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  //================ Selected Day Task Data ================
  const selectedDateKey = getLocalDateKey(selectedDate);
  const markedDates = tasks.map(getTaskDayKey);
  const dayTasks = tasks.filter(
    (task) => getTaskDayKey(task) === selectedDateKey
  );
  const taskGroups = Object.entries(groupTasksByCategory(dayTasks));

  const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  //================ Task Card Actions ================
  function moveTaskToRecyclingBin(task) {
    deleteTask(task.id);
    setSelectedTask((currentTask) =>
      currentTask?.id === task.id ? null : currentTask
    );
  }

  //================ Modal Scroll Lock ================
  // Same scroll lock as the Home page while a modal is open.
  useEffect(() => {
    const panel = document.querySelector(".app-panel");

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
    <div className="calendar-page">
      <h1 className="page-title">Calendar</h1>

      <Calendar
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
        markedDates={markedDates}
      />

      <section className="calendar-day-tasks" aria-label="Tasks for selected day">
        <h2 className="calendar-day-tasks-title">{selectedDateLabel}</h2>

        {taskGroups.length === 0 && (
          <div className="calendar-empty-state">
            <img src={emptyItemIcon} alt="" />
            <p>No tasks scheduled for this day...</p>
          </div>
        )}

        <div className="home-task-list">
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
              onCategoryDelete={setCategoryToDelete}
              onCategoryComplete={({ tasks: completedTasks }) => {
                completedTasks.forEach(moveTaskToRecyclingBin);
              }}
            />
          ))}
        </div>
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

export default CalendarPage;
