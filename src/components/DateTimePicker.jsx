import { useEffect, useRef, useState } from "react";
import SmartSelect from "./SmartSelect";
import { createNumberOptions } from "../utils/taskForm";

const dayOptions = createNumberOptions(31, 1);
const monthOptions = createNumberOptions(12, 1);
const hourOptions = createNumberOptions(12, 1);
const minuteOptions = createNumberOptions(60);

const dateTimeFields = [
  { key: "day", label: "Day", options: dayOptions },
  { key: "month", label: "Month", options: monthOptions },
  { key: "hour", label: "Hour", options: hourOptions },
  { key: "minute", label: "Minute", options: minuteOptions },
  { key: "period", label: "AM/PM", options: ["AM", "PM"] },
];

function DateTimePicker({ legend = "Date and Time", value, onChange }) {
  const pickerRef = useRef(null);
  const [openField, setOpenField] = useState(null);
  const [dropdownDirection, setDropdownDirection] = useState("down");

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

  return (
    <fieldset ref={pickerRef} className="date-time-picker">
      <legend>{legend}</legend>

      <div className="date-time-grid">
        {dateTimeFields.map((field) => (
          <label key={field.key}>
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
