import eventIcon from "../assets/event-icon.avif";
import otherIcon from "../assets/other-icon.avif";
import personalIcon from "../assets/personal-icon.avif";
import schoolIcon from "../assets/school-icon.avif";
import workIcon from "../assets/work-icon.avif";

export const TITLE_LIMIT = 50;
export const DESCRIPTION_LIMIT = 200;

export const CATEGORY_OPTIONS = [
  { value: "School", label: "School", icon: schoolIcon },
  { value: "Work", label: "Work", icon: workIcon },
  { value: "Personal", label: "Personal", icon: personalIcon },
  { value: "Event", label: "Event", icon: eventIcon },
  { value: "Other", label: "Other", icon: otherIcon },
];

export const DEFAULT_DATE_TIME = {
  day: "01",
  month: "01",
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

export function formatDueDate({ day, month, hour, minute, period }) {
  return `${day}/${month} ${hour}:${minute} ${period}`;
}
