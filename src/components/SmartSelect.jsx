import { useEffect, useRef, useState } from "react";

function SmartSelect({
  value,
  options,
  isOpen,
  direction,
  placeholder = "",
  editable = true,
  onOpen,
  onChange,
}) {
  const selectRef = useRef(null);
  const optionItems = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );
  const optionValues = optionItems.map((option) => option.value);
  const selectedOption = optionItems.find((option) => option.value === value);
  const [draftValue, setDraftValue] = useState(value || placeholder);
  const isNumeric = optionValues.every((option) => /^\d+$/.test(option));
  const maxLength = Math.max(...optionValues.map((option) => option.length));

  useEffect(() => {
    setDraftValue(selectedOption?.label || value || placeholder);
  }, [placeholder, selectedOption?.label, value]);

  function handleOpen() {
    const rect = selectRef.current?.getBoundingClientRect();
    const nextDirection =
      rect && rect.top < window.innerHeight / 2 ? "down" : "up";

    onOpen(nextDirection);
  }

  function handleInputChange(event) {
    const nextValue = event.target.value.slice(0, maxLength);

    if (isNumeric) {
      const digitsOnly = nextValue.replace(/\D/g, "").slice(0, maxLength);
      setDraftValue(digitsOnly);

      if (digitsOnly.length === maxLength && optionValues.includes(digitsOnly)) {
        onChange(digitsOnly);
      }

      return;
    }

    setDraftValue(nextValue);

    if (optionValues.includes(nextValue)) {
      onChange(nextValue);
    }
  }

  function handleInputBlur() {
    if (isNumeric) {
      if (!draftValue) {
        setDraftValue(value);
        return;
      }

      const numberValue = Number(draftValue);
      const minValue = Number(optionValues[0]);
      const maxValue = Number(optionValues[optionValues.length - 1]);
      const clampedValue = Math.min(Math.max(numberValue, minValue), maxValue);
      const normalizedValue = String(clampedValue).padStart(maxLength, "0");

      setDraftValue(normalizedValue);
      onChange(normalizedValue);
      return;
    }

    if (!optionValues.includes(draftValue) && draftValue !== placeholder) {
      setDraftValue(selectedOption?.label || value || placeholder);
    }
  }

  return (
    <div ref={selectRef} className={`smart-select smart-select-${direction}`}>
      {editable ? (
        <div className="smart-select-control">
          <input
            className="smart-select-input"
            inputMode={isNumeric ? "numeric" : "text"}
            value={draftValue}
            maxLength={maxLength}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
          />

          <button
            className="smart-select-trigger"
            type="button"
            aria-label="Show options"
          aria-expanded={isOpen}
          onClick={handleOpen}
        >
          <span className="smart-select-arrow" aria-hidden="true" />
        </button>
        </div>
      ) : (
        <button
          className="smart-select-display"
          type="button"
          aria-expanded={isOpen}
          onClick={handleOpen}
        >
          <span>{value || placeholder}</span>
          <span className="smart-select-arrow" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div className="smart-select-menu">
          {optionItems.map((option) => (
            <button
              key={option.value}
              className={`smart-select-option ${
                option.value === value ? "is-selected" : ""
              }`}
              type="button"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SmartSelect;
