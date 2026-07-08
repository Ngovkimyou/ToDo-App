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
