import { useEffect, useState } from "react";
import Calendar from "../components/Calendar";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import HomeTaskCard from "../components/HomeTaskCard";
import HomeTaskModal from "../components/HomeTaskModal";
import { useTasks } from "../context/TaskContext";
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

  // Same scroll lock as the Home page while a modal is open.
  useEffect(() => {
    const panel = document.querySelector(".app-panel");

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
          <p className="calendar-no-tasks">No tasks on this day.</p>
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

export default CalendarPage;
