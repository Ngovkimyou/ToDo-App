export const TITLE_LIMIT = 50;
export const DESCRIPTION_LIMIT = 200;

export const CATEGORY_OPTIONS = [
  { value: "School", label: "🏫 School" },
  { value: "Work", label: "🏢 Work" },
  { value: "Personal", label: "👤 Personal" },
  { value: "Event", label: "📅 Event" },
  { value: "Other", label: "❓ Other" },
];

// Defaults to today, so a task created without touching the date
// picker automatically becomes today's task.
const now = new Date();

export const DEFAULT_DATE_TIME = {
  day: String(now.getDate()).padStart(2, "0"),
  month: String(now.getMonth() + 1).padStart(2, "0"),
  year: String(now.getFullYear()),
  hour: "12",
  minute: "00",
  period: "AM",
};

export function createNumberOptions(length, start = 0) {
  return Array.from({ length }, (_, index) =>
    String(index + start).padStart(2, "0")
  );
}

export function getCharacterStatus(length, limit) {
  if (length >= limit) {
    return "is-limit";
  }

  if (limit - length <= 10) {
    return "is-warning";
  }

  return "";
}

export function formatDueDate({ day, month, year, hour, minute, period }) {
  return `${day}/${month}/${year} ${hour}:${minute} ${period}`;
}
