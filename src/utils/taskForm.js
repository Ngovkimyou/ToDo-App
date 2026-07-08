export const TITLE_LIMIT = 50;
export const DESCRIPTION_LIMIT = 200;

export const CATEGORY_OPTIONS = [
  { value: "School", label: "🏫 School" },
  { value: "Work", label: "🏢 Work" },
  { value: "Personal", label: "👤 Personal" },
  { value: "Event", label: "📅 Event" },
  { value: "Other", label: "❓ Other" },
];

export const DEFAULT_DATE_TIME = {
  day: "01",
  month: "01",
  year: String(new Date().getFullYear()),
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
