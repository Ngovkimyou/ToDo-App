import { useState } from "react";
import { getLocalDateKey } from "../utils/date";
import "./Calendar.css";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Builds the 42 cells (6 weeks) for the day grid. Cells that belong to the
// previous or next month carry an offset so a click can jump to that month.
function getCalendarCells(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ day: daysInPrevMonth - i + 1, offset: -1 });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, offset: 0 });
  }
  let nextMonthDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextMonthDay, offset: 1 });
    nextMonthDay++;
  }
  return cells;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function Calendar({ selectedDate, onDaySelect, markedDates = [] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("days"); // "days" | "months" | "years"
  // Animation class for the body: "slide-left", "slide-right",
  // "zoom-in" (drill down) or "zoom-out" (drill up).
  const [animation, setAnimation] = useState("");

  const startYear = Math.floor(year / 12) * 12;

  const yearRange = [];
  for (let y = startYear; y < startYear + 12; y++) {
    yearRange.push(y);
  }

  // The body remounts whenever this key changes, which restarts the
  // CSS animation. It changes on every navigation, but not when a day
  // in the current month is selected.
  const bodyKey = view + "-" + year + "-" + month;

  function goPrevious() {
    setAnimation("slide-right");
    if (view === "days") {
      const date = new Date(year, month - 1, 1);
      setYear(date.getFullYear());
      setMonth(date.getMonth());
    } else if (view === "months") {
      setYear(year - 1);
    } else {
      setYear(year - 12);
    }
  }

  function goNext() {
    setAnimation("slide-left");
    if (view === "days") {
      const date = new Date(year, month + 1, 1);
      setYear(date.getFullYear());
      setMonth(date.getMonth());
    } else if (view === "months") {
      setYear(year + 1);
    } else {
      setYear(year + 12);
    }
  }

  function showMonths() {
    setView("months");
    setAnimation("zoom-out");
  }

  function showYears() {
    setView("years");
    setAnimation("zoom-out");
  }

  function pickMonth(index) {
    setMonth(index);
    setView("days");
    setAnimation("zoom-in");
  }

  function pickYear(y) {
    setYear(y);
    setView("months");
    setAnimation("zoom-in");
  }

  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setView("days");
    setAnimation("zoom-in");
    if (onDaySelect) {
      onDaySelect(today);
    }
  }

  function handleDayClick(cell) {
    const date = new Date(year, month + cell.offset, cell.day);
    if (onDaySelect) {
      onDaySelect(date);
    }
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    if (cell.offset === -1) {
      setAnimation("slide-right");
    } else if (cell.offset === 1) {
      setAnimation("slide-left");
    }
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={goPrevious} aria-label="Previous">
          &#8249;
        </button>

        <div className="calendar-title">
          {view === "days" && (
            <>
              <button className="calendar-title-button" onClick={showMonths}>
                {MONTH_NAMES[month]}
              </button>
              <button className="calendar-title-button" onClick={showYears}>
                {year}
              </button>
            </>
          )}
          {view === "months" && (
            <button className="calendar-title-button" onClick={showYears}>
              {year}
            </button>
          )}
          {view === "years" && (
            <span className="calendar-title-label">
              {startYear} - {startYear + 11}
            </span>
          )}
        </div>

        <button className="calendar-nav" onClick={goNext} aria-label="Next">
          &#8250;
        </button>
      </div>

      <div key={bodyKey} className={"calendar-body " + animation}>
        {view === "days" && (
          <div className="calendar-day-grid">
            {DAY_NAMES.map((name) => (
              <span key={name} className="calendar-day-name">
                {name}
              </span>
            ))}
            {getCalendarCells(year, month).map((cell, index) => {
              const cellDate = new Date(year, month + cell.offset, cell.day);
              const hasTasks = markedDates.includes(getLocalDateKey(cellDate));
              let className = "calendar-day";
              if (cell.offset !== 0) className += " outside";
              if (isSameDay(cellDate, today)) className += " today";
              if (selectedDate && isSameDay(cellDate, selectedDate)) {
                className += " selected";
              }
              return (
                <button
                  key={index}
                  className={className}
                  onClick={() => handleDayClick(cell)}
                >
                  {cell.day}
                  {hasTasks && <span className="calendar-day-dot" />}
                </button>
              );
            })}
          </div>
        )}

        {view === "months" && (
          <div className="calendar-pick-grid">
            {MONTH_NAMES.map((name, index) => (
              <button
                key={name}
                className={
                  "calendar-pick" + (index === month ? " active" : "")
                }
                onClick={() => pickMonth(index)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {view === "years" && (
          <div className="calendar-pick-grid">
            {yearRange.map((y) => (
              <button
                key={y}
                className={"calendar-pick" + (y === year ? " active" : "")}
                onClick={() => pickYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="calendar-today-button"
        onClick={goToToday}
        disabled={
          view === "days" &&
          year === today.getFullYear() &&
          month === today.getMonth()
        }
      >
        Today
      </button>
    </div>
  );
}

export default Calendar;
