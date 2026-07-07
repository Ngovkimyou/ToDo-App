import { useState } from "react";
import { useTasks } from "../context/TaskContext";

function Home() {
  const { tasks, toggleComplete, deleteTask } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTasks =
    selectedCategory === "All"
      ? tasks
      : tasks.filter((task) => task.category === selectedCategory);

  return (
    <div>
      <h1 className="page-title">Home</h1>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="All">All</option>
        <option value="School">School</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="Other">Other</option>
      </select>

      {filteredTasks.map((task) => (
        <div key={task.id}>
          <h2>{task.title}</h2>
          <p>{task.description}</p>
          <p>Due: {task.dueDate}</p>
          <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>
          <p>Category: {task.category}</p>

          <button onClick={() => toggleComplete(task.id)}>
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </button>

          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Home;
