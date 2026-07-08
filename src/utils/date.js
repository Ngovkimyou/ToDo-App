export function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Turns a task's due date ("DD/MM/YYYY HH:MM AM") into a "YYYY-MM-DD" key.
// Returns null when the task has no readable due date.
export function getTaskDueDateKey(task) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(task.dueDate || "");

  if (!match) {
    return null;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

// Day a task shows up on in the calendar: its due date, or the day it
// was created when it has no readable due date.
export function getTaskDayKey(task) {
  return getTaskDueDateKey(task) || getTaskCreatedDateKey(task);
}

export function getTaskCreatedDateKey(task) {
  if (task.createdDate) {
    return task.createdDate;
  }

  if (task.createdAt) {
    return getLocalDateKey(new Date(task.createdAt));
  }

  return getLocalDateKey(new Date(task.id));
}
