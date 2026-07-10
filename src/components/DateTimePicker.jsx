import { useEffect, useRef, useState } from "react";
import SmartSelect from "./SmartSelect";
import { createNumberOptions } from "../utils/taskForm";

const dayOptions = createNumberOptions(31, 1);
const monthOptions = createNumberOptions(12, 1);
const hourOptions = createNumberOptions(12, 1);
const minuteOptions = createNumberOptions(60);

//================ Select Option Setup ================
const currentYear = new Date().getFullYear();
const yearOptions = [];
for (let year = currentYear; year <= currentYear + 4; year++) {
  yearOptions.push(String(year));
}

const dateTimeFields = [
  { key: "day", label: "Day", options: dayOptions },
  { key: "month", label: "Month", options: monthOptions },
  { key: "year", label: "Year", options: yearOptions },
  { key: "hour", label: "Hour", options: hourOptions },
  { key: "minute", label: "Minute", options: minuteOptions },
  { key: "period", label: "AM/PM", options: ["AM", "PM"] },
];

function DateTimePicker({
  legend = "Date and Time",
  value,
  onChange,
  onNavigate,
}) {
  const pickerRef = useRef(null);
  const fieldRefs = useRef([]);
  const [openField, setOpenField] = useState(null);
  const [dropdownDirection, setDropdownDirection] = useState("down");

  //================ Close Date Dropdown On Outside Click ================
  useEffect(() => {
    function handleClickOutside(event) {
      if (!pickerRef.current?.contains(event.target)) {
        setOpenField(null);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  function isDesktopKeyboard() {
    return !window.matchMedia("(max-width: 900px)").matches;
  }

  function focusField(fieldIndex) {
    const nextField = fieldRefs.current[fieldIndex];
    const nextControl = nextField?.querySelector(
      ".smart-select-input, .smart-select-display, .smart-select-trigger"
    );

    nextControl?.focus();
  }

  //================ Desktop Keyboard Navigation ================
  function handleKeyDownCapture(event) {
    if (!isDesktopKeyboard()) {
      return;
    }

    const currentFieldIndex = dateTimeFields.findIndex((field) =>
      event.target.closest(`.date-time-field-${field.key}`)
    );

    if (currentFieldIndex === -1) {
      return;
    }

    const hasOpenMenu = openField !== null;

    if (event.key === "ArrowDown" && !hasOpenMenu) {
      event.preventDefault();
      onNavigate?.("next");
      return;
    }

    if (event.key === "ArrowUp" && !hasOpenMenu) {
      event.preventDefault();
      onNavigate?.("previous");
      return;
    }

    if (event.key === "ArrowRight" || event.key === "End") {
      event.preventDefault();
      setOpenField(null);
      focusField(
        event.key === "End"
          ? dateTimeFields.length - 1
          : Math.min(currentFieldIndex + 1, dateTimeFields.length - 1)
      );
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "Home") {
      event.preventDefault();
      setOpenField(null);
      focusField(
        event.key === "Home" ? 0 : Math.max(currentFieldIndex - 1, 0)
      );
    }
  }

  return (
    <fieldset
      ref={pickerRef}
      className="date-time-picker"
      onKeyDownCapture={handleKeyDownCapture}
    >
      <legend>{legend}</legend>

      <div className="date-time-grid">
        {dateTimeFields.map((field, fieldIndex) => (
          <label
            ref={(element) => {
              fieldRefs.current[fieldIndex] = element;
            }}
            className={`date-time-field-${field.key}`}
            key={field.key}
          >
            <span>{field.label}</span>
            <SmartSelect
              value={value[field.key]}
              options={field.options}
              isOpen={openField === field.key}
              direction={dropdownDirection}
              onOpen={(direction) => {
                setDropdownDirection(direction);
                setOpenField((currentField) =>
                  currentField === field.key ? null : field.key
                );
              }}
              onClose={() => setOpenField(null)}
              onChange={(nextValue) => {
                onChange(field.key, nextValue);
                setOpenField(null);
              }}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default DateTimePicker;
