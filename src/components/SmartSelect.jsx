import { useEffect, useMemo, useRef, useState } from "react";

function SmartSelect({
  value,
  options,
  isOpen,
  direction,
  placeholder = "",
  editable = true,
  onOpen,
  onClose,
  onChange,
}) {
  const selectRef = useRef(null);
  const optionRefs = useRef([]);

  //================ Option Normalization ================
  const optionItems = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string" ? { value: option, label: option } : option
      ),
    [options]
  );
  const optionValues = optionItems.map((option) => option.value);
  const selectedOption = optionItems.find((option) => option.value === value);
  const [draftValue, setDraftValue] = useState(value || placeholder);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const isNumeric = optionValues.every((option) => /^\d+$/.test(option));
  const maxLength = Math.max(...optionValues.map((option) => option.length));

  //================ Sync Displayed Value And Highlight ================
  useEffect(() => {
    // Keep the editable draft aligned when an external selection changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftValue(selectedOption?.label || value || placeholder);
  }, [placeholder, selectedOption?.label, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedIndex = optionItems.findIndex(
      (option) => option.value === value
    );
    // Highlighting depends on the menu opening, so sync it at that moment.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, optionItems, value]);

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, isOpen]);

  //================ Dropdown Opening And Keyboard Control ================
  function handleOpen(event) {
    const rect = selectRef.current?.getBoundingClientRect();
    const nextDirection =
      rect && rect.top < window.innerHeight / 2 ? "down" : "up";

    onOpen(nextDirection);

    if (isOpen) {
      event.currentTarget.blur();
    }
  }

  function isDesktopKeyboard() {
    return !window.matchMedia("(max-width: 900px)").matches;
  }

  function handleKeyboardOpen(event) {
    if (!isDesktopKeyboard()) {
      return;
    }

    if (isOpen) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleOpen(event);
  }

  function handleKeyDown(event) {
    if (!isDesktopKeyboard()) {
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setHighlightedIndex((currentIndex) =>
        Math.min(currentIndex + 1, optionItems.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onChange(optionItems[highlightedIndex].value);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }
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

  //================ Numeric Input Validation ================
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

  function renderOptionContent(option) {
    return (
      <span className="smart-select-value">
        {option.icon && (
          <img className="smart-select-icon" src={option.icon} alt="" />
        )}
        <span>{option.label}</span>
      </span>
    );
  }

  return (
    <div
      ref={selectRef}
      className={`smart-select smart-select-${direction}`}
      onKeyDown={handleKeyDown}
    >
      {editable ? (
        <div className="smart-select-control">
          <input
            className="smart-select-input"
            inputMode={isNumeric ? "numeric" : "text"}
            value={draftValue}
            maxLength={maxLength}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onKeyDown={handleKeyboardOpen}
          />

          <button
            className="smart-select-trigger"
            type="button"
            aria-label="Show options"
            aria-expanded={isOpen}
            onClick={handleOpen}
            onKeyDown={handleKeyboardOpen}
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
          onKeyDown={handleKeyboardOpen}
        >
          {selectedOption ? (
            renderOptionContent(selectedOption)
          ) : (
            <span>{value || placeholder}</span>
          )}
          <span className="smart-select-arrow" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div className="smart-select-menu">
          {optionItems.map((option, optionIndex) => (
            <button
              ref={(element) => {
                optionRefs.current[optionIndex] = element;
              }}
              key={option.value}
              className={`smart-select-option ${
                optionIndex === highlightedIndex ? "is-selected" : ""
              }`}
              type="button"
              onClick={() => onChange(option.value)}
            >
              {renderOptionContent(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SmartSelect;
