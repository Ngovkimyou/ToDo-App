import { useEffect, useState } from "react";
import { getLocalDateKey } from "../utils/date";

const DAY_COUNT = 7;
const VISIBLE_COUNT = 5;
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2);
const TODAY_INDEX = Math.floor(DAY_COUNT / 2);

//================ Date Strip Helpers ================
function createDateFromKey(dateKey) {
  const [year, month, day] = (dateKey || "").split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function buildDateRange(centerDate = new Date()) {
  const baseDate = new Date(centerDate);
  baseDate.setHours(0, 0, 0, 0);

  return Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index - TODAY_INDEX);
    return date;
  });
}

function formatDayLabel(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) {
    return "Today";
  }

  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getVisiblePositionClass(dateIndex, selectedIndex) {
  const visiblePosition = dateIndex - selectedIndex + CENTER_INDEX;

  if (visiblePosition < 0 || visiblePosition >= VISIBLE_COUNT) {
    return "date-card-hidden";
  }

  return `date-card-position-${visiblePosition + 1}`;
}

function HomeDateStrip({ selectedDateKey, onDateChange }) {
  const [dates, setDates] = useState(() =>
    buildDateRange(createDateFromKey(selectedDateKey))
  );
  const [selectedIndex, setSelectedIndex] = useState(TODAY_INDEX);

  const trackOffset = selectedIndex - CENTER_INDEX;
  const selectedDate = dates[selectedIndex];
  const isTodaySelected =
    getLocalDateKey(selectedDate) === getLocalDateKey(new Date());
  const monthTitle = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function goPrevious() {
    selectDate(Math.max(selectedIndex - 1, 0));
  }

  function goNext() {
    selectDate(Math.min(selectedIndex + 1, DAY_COUNT - 1));
  }

  function selectDate(dateIndex) {
    setSelectedIndex(dateIndex);
    onDateChange?.(getLocalDateKey(dates[dateIndex]));
  }

  function resetToToday() {
    const todayRange = buildDateRange();
    setDates(todayRange);
    setSelectedIndex(TODAY_INDEX);
    onDateChange?.(getLocalDateKey(todayRange[TODAY_INDEX]));
  }

  //================ Sync External Date Changes ================
  useEffect(() => {
    const matchingIndex = dates.findIndex(
      (date) => getLocalDateKey(date) === selectedDateKey
    );

    if (matchingIndex !== -1) {
      // Keep the animated strip aligned when the selected date comes from routing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(matchingIndex);
      return;
    }

    const nextDate = createDateFromKey(selectedDateKey);
    setDates(buildDateRange(nextDate));
    setSelectedIndex(TODAY_INDEX);
  }, [dates, selectedDateKey]);

  return (
    <section className="home-date-strip" aria-label="Choose task date">
      <button
        className="date-strip-title"
        type="button"
        onClick={resetToToday}
        aria-label="Return to today"
        disabled={isTodaySelected}
      >
        {monthTitle}
        <span className="date-title-reset" aria-hidden="true">
          ↺
        </span>
      </button>

      <button
        className="date-nav-button date-nav-left"
        type="button"
        onClick={goPrevious}
        disabled={selectedIndex === 0}
        aria-label="Previous day"
      >
        {"<"}
      </button>

      <div className="date-list">
        <div className="date-track" style={{ "--date-offset": trackOffset }}>
          {dates.map((date, dateIndex) => {
            const isSelected = dateIndex === selectedIndex;
            const positionClass = getVisiblePositionClass(
              dateIndex,
              selectedIndex,
            );

            return (
              <button
                className={`date-card ${positionClass} ${
                  isSelected ? "date-card-active" : ""
                }`}
                type="button"
                key={date.toISOString()}
                onClick={() => selectDate(dateIndex)}
              >
                <span className="date-number">{date.getDate()}</span>
                <span className="date-day">{formatDayLabel(date)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="date-nav-button date-nav-right"
        type="button"
        onClick={goNext}
        disabled={selectedIndex === DAY_COUNT - 1}
        aria-label="Next day"
      >
        {">"}
      </button>
    </section>
  );
}

export default HomeDateStrip;
