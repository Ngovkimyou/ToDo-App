import { useEffect, useRef, useState } from "react";
import SmartSelect from "./SmartSelect";
import { CATEGORY_OPTIONS } from "../utils/taskForm";

const filterOptions = [{ value: "All", label: "All" }, ...CATEGORY_OPTIONS];

function HomeFilterSelect({ value, onChange }) {
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
    <label ref={fieldRef} className="home-filter-field">
      <span>Filter</span>
      <SmartSelect
        value={value}
        options={filterOptions}
        isOpen={isOpen}
        direction={direction}
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

export default HomeFilterSelect;
