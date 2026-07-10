export function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

export function getTaskDueDateKey(task) {
  const match = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/.exec(
    task.dueDate || ""
  );

  if (!match) {
    return getTaskCreatedDateKey(task);
  }

  const day = String(match[1]).padStart(2, "0");
  const month = String(match[2]).padStart(2, "0");
  const year = match[3] || getTaskCreatedDateKey(task).slice(0, 4);

  return `${year}-${month}-${day}`;
}

export function getTaskDayKey(task) {
  return getTaskDueDateKey(task);
}
