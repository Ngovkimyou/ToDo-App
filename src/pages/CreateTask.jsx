import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategorySelect from "../components/CategorySelect";
import CharacterLimitedField from "../components/CharacterLimitedField";
import DateTimePicker from "../components/DateTimePicker";
import KeyboardHelpModal from "../components/KeyboardHelpModal";
import { useTasks } from "../context/useTasks";
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
  const formRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState(getCurrentDateTime);
  const [endDateTime, setEndDateTime] = useState(getCurrentDateTime);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [category, setCategory] = useState("");
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);

  //================ Validation State ================
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

  //================ Desktop Keyboard Navigation ================
  function isDesktopKeyboard() {
    return !window.matchMedia("(max-width: 900px)").matches;
  }

  function focusSection(sectionName) {
    if (sectionName === "end" && hasEndDate) {
      focusDateInput("end");
      return;
    }

    const section = formRef.current?.querySelector(
      `[data-keyboard-section="${sectionName}"]`
    );
    const focusableSelector =
      'input:not([type="hidden"]), textarea, button:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const focusTarget = section?.matches(focusableSelector)
      ? section
      : section?.querySelector(focusableSelector);

    focusTarget?.focus();
  }

  function focusDateInput(sectionName) {
    const dateInput = formRef.current?.querySelector(
      `[data-keyboard-section="${sectionName}"] .date-time-picker .smart-select-input`
    );

    dateInput?.focus();
  }

  function handleFormKeyDown(event) {
    if (!isDesktopKeyboard()) {
      return;
    }

    if (event.target.closest(".date-time-picker")) {
      return;
    }

    const openSelect = event.target.closest(".smart-select")?.querySelector(
      ".smart-select-menu"
    );

    if (openSelect && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      return;
    }

    const currentSection = event.target.closest("[data-keyboard-section]")
      ?.dataset.keyboardSection;

    if (!currentSection) {
      return;
    }

    const sections = ["title", "description", "start", "end", "category", "submit"];
    const currentIndex = sections.indexOf(currentSection);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSection(sections[Math.min(currentIndex + 1, sections.length - 1)]);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSection(sections[Math.max(currentIndex - 1, 0)]);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canCreateTask) {
      return;
    }

    const dueDate = formatDueDate(startDateTime);

    // Store both display dates and normalized metadata used by Home filtering.
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
      <div className="create-task-heading">
        <h1 className="page-title">Create Task</h1>
        <button
          className="keyboard-help-button"
          type="button"
          aria-label="Open keyboard support tutorial"
          onClick={() => setIsKeyboardHelpOpen(true)}
        >
          ?
        </button>
      </div>

      <form
        ref={formRef}
        className="task-form"
        onKeyDownCapture={handleFormKeyDown}
        onSubmit={handleSubmit}
      >
        <div data-keyboard-section="title">
          <CharacterLimitedField
            label="Title"
            value={title}
            limit={TITLE_LIMIT}
            status={titleStatus}
            placeholder="Task title"
            onChange={setTitle}
          />
        </div>

        <div data-keyboard-section="description">
          <CharacterLimitedField
            label="Description"
            value={description}
            limit={DESCRIPTION_LIMIT}
            status={descriptionStatus}
            placeholder="Write a short note"
            multiline
            onChange={setDescription}
          />
        </div>

        <div data-keyboard-section="start">
          <DateTimePicker
            legend="Starting Date and Time"
            value={startDateTime}
            onChange={handleStartDateTimeChange}
            onNavigate={(direction) =>
              focusSection(direction === "next" ? "end" : "description")
            }
          />
        </div>

        <section className="ending-date-section" data-keyboard-section="end">
          <label
            className="ending-date-toggle"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") {
                return;
              }

              event.preventDefault();
              setHasEndDate((currentValue) => {
                const nextValue = !currentValue;

                if (nextValue) {
                  window.setTimeout(() => focusDateInput("end"));
                }

                return nextValue;
              });
            }}
          >
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
              onNavigate={(direction) =>
                focusSection(direction === "next" ? "category" : "start")
              }
            />
          )}
        </section>

        <div data-keyboard-section="category">
          <CategorySelect value={category} onChange={setCategory} />
        </div>

        <button
          data-keyboard-section="submit"
          className="create-task-button"
          type="submit"
          disabled={!canCreateTask}
        >
          Create Task
        </button>
      </form>

      <KeyboardHelpModal
        open={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
      />
    </div>
  );
}

export default CreateTask;
