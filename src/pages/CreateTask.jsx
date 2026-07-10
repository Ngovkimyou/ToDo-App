import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategorySelect from "../components/CategorySelect";
import CharacterLimitedField from "../components/CharacterLimitedField";
import DateTimePicker from "../components/DateTimePicker";
import { useTasks } from "../context/TaskContext";
import { getLocalDateKey } from "../utils/date";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  formatDueDate,
  getCurrentDateTime,
  getCharacterStatus,
} from "../utils/taskForm";
import "./CreateTask.css";

function CreateTask() {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState(getCurrentDateTime);
  const [endDateTime, setEndDateTime] = useState(getCurrentDateTime);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [category, setCategory] = useState("");

  const canCreateTask = title.trim().length > 0;
  const titleStatus = getCharacterStatus(title.length, TITLE_LIMIT);
  const descriptionStatus = getCharacterStatus(
    description.length,
    DESCRIPTION_LIMIT
  );

  function handleStartDateTimeChange(field, value) {
    setStartDateTime((currentDateTime) => ({
      ...currentDateTime,
      [field]: value,
    }));
  }

  function handleEndDateTimeChange(field, value) {
    setEndDateTime((currentDateTime) => ({
      ...currentDateTime,
      [field]: value,
    }));
  }

  function getDateTimeKey(dateTime) {
    return `${dateTime.year}-${dateTime.month}-${dateTime.day}`;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canCreateTask) {
      return;
    }

    const dueDate = formatDueDate(startDateTime);

    addTask({
      id: Date.now(),
      title: title.trim(),
      description,
      dueDate,
      endDate: hasEndDate ? formatDueDate(endDateTime) : "",
      createdAt: new Date().toISOString(),
      createdDate: getLocalDateKey(new Date()),
      category,
      completed: false,
    });

    navigate("/", {
      state: {
        selectedDate: getDateTimeKey(startDateTime),
      },
    });
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

        <DateTimePicker
          legend="Starting Date and Time"
          value={startDateTime}
          onChange={handleStartDateTimeChange}
        />

        <section className="ending-date-section">
          <label className="ending-date-toggle">
            <span>Ending Date and Time</span>
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={(event) => setHasEndDate(event.target.checked)}
            />
            <span className="ending-date-switch" aria-hidden="true">
              <span className="ending-date-status ending-date-status-enabled">
                Enabled
              </span>
              <span className="ending-date-status ending-date-status-unenabled">
                Unenabled
              </span>
              <span className="ending-date-knob" />
            </span>
          </label>

          {hasEndDate && (
            <DateTimePicker
              legend="Ending Date and Time"
              value={endDateTime}
              onChange={handleEndDateTimeChange}
            />
          )}
        </section>

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
