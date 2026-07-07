import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

function CreateTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("01");
  const [month, setMonth] = useState("01");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [category, setCategory] = useState("");

  const canCreateTask = title.trim().length > 0;
  const dayOptions = Array.from({ length: 31 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );
  const monthOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );
  const hourOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );
  const minuteOptions = Array.from({ length: 60 }, (_, index) =>
    String(index).padStart(2, "0")
  );

  function handleSubmit(e) {
    e.preventDefault();

    if (!canCreateTask) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description,
      dueDate: `${day}/${month} ${hour}:${minute} ${period}`,
      category,
      completed: false,
    };

    addTask(newTask);
    navigate("/");
  }

  return (
    <div className="create-task-page">
      <h1 className="page-title">Create Task</h1>

      <form className="task-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Title</span>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea
            placeholder="Write a short note"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <fieldset className="date-time-picker">
          <legend>Date and Time</legend>

          <div className="date-time-grid">
            <label>
              <span>Day</span>
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                {dayOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Month</span>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {monthOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Hour</span>
              <select value={hour} onChange={(e) => setHour(e.target.value)}>
                {hourOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Minute</span>
              <select value={minute} onChange={(e) => setMinute(e.target.value)}>
                {minuteOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>AM/PM</span>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </label>
          </div>
        </fieldset>

        <label className="form-field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="School">School</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <button className="create-task-button" type="submit" disabled={!canCreateTask}>
          Create Task
        </button>
      </form>
    </div>
  );
}

export default CreateTask;
