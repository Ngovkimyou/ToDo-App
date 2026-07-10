//================ Task Collection Helpers ================
export function groupTasksByCategory(tasks) {
  return tasks.reduce((groups, task) => {
    const category = task.category || "No category";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(task);
    return groups;
  }, {});
}
