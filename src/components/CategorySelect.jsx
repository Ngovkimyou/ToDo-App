import { useEffect, useRef, useState } from "react";
import { CATEGORY_OPTIONS } from "../utils/taskForm";
import SmartSelect from "./SmartSelect";

function CategorySelect({ value, onChange }) {
  const fieldRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState("down");

  useEffect(() => {
    function handleClickOutside(event) {
      if (!fieldRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  return (
    <label ref={fieldRef} className="form-field">
      <span>Category</span>
      <SmartSelect
        value={value}
        options={CATEGORY_OPTIONS}
        isOpen={isOpen}
        direction={direction}
        placeholder="Select Category"
        editable={false}
        onOpen={(nextDirection) => {
          setDirection(nextDirection);
          setIsOpen((currentIsOpen) => !currentIsOpen);
        }}
        onChange={(nextValue) => {
          onChange(nextValue);
          setIsOpen(false);
        }}
      />
    </label>
  );
}

export default CategorySelect;
