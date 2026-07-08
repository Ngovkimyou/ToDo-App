import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategorySelect from "../components/CategorySelect";
import CharacterLimitedField from "../components/CharacterLimitedField";
import DateTimePicker from "../components/DateTimePicker";
import { useTasks } from "../context/TaskContext";
import { getLocalDateKey } from "../utils/date";
import {
  DEFAULT_DATE_TIME,
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  formatDueDate,
  getCharacterStatus,
} from "../utils/taskForm";
import "./CreateTask.css";

function CreateTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState(DEFAULT_DATE_TIME);
  const [category, setCategory] = useState("");

  const canCreateTask = title.trim().length > 0;
  const titleStatus = getCharacterStatus(title.length, TITLE_LIMIT);
  const descriptionStatus = getCharacterStatus(
    description.length,
    DESCRIPTION_LIMIT
  );

  function handleDateTimeChange(field, value) {
    setDateTime((currentDateTime) => ({
      ...currentDateTime,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canCreateTask) {
      return;
    }

    addTask({
      id: Date.now(),
      title: title.trim(),
      description,
      dueDate: formatDueDate(dateTime),
      createdAt: new Date().toISOString(),
      createdDate: getLocalDateKey(new Date()),
      category,
      completed: false,
    });

    navigate("/");
  }

  return (
    <div className="create-task-page">
      <h1 className="page-title">Create Task</h1>

      <form className="task-form" onSubmit={handleSubmit}>
        <CharacterLimitedField
          label="Title"
          value={title}
          limit={TITLE_LIMIT}
          status={titleStatus}
          placeholder="Task title"
          onChange={setTitle}
        />

        <CharacterLimitedField
          label="Description"
          value={description}
          limit={DESCRIPTION_LIMIT}
          status={descriptionStatus}
          placeholder="Write a short note"
          multiline
          onChange={setDescription}
        />

        <DateTimePicker value={dateTime} onChange={handleDateTimeChange} />

        <CategorySelect value={category} onChange={setCategory} />

        <button
          className="create-task-button"
          type="submit"
          disabled={!canCreateTask}
        >
          Create Task
        </button>
      </form>
    </div>
  );
}

export default CreateTask;
