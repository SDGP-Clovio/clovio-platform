import type { Meeting } from "../types/index";
import { useState } from "react";

interface MiniCalendarProps {
  meetings: Meeting[];
  initialYear?: number;
  initialMonth?: number; // 0-indexed
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MiniCalendar({
  meetings,
  initialYear = new Date().getFullYear(), //Getting current date and month
  initialMonth = new Date().getMonth(),
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [currentYear, setCurrentYear] = useState(initialYear)

  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth

  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
  });


  // Map meetings to day numbers
  const meetingMap = new Map<string, Meeting[]>();

  meetings.forEach((m) => {
    const key = `${m.month}-${m.day}`;

    if (!meetingMap.has(key)) meetingMap.set(key, []);
    meetingMap.get(key)!.push(m);
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const totalCells = firstDay + daysInMonth;
  const trailingEmpty = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  return (
    <div className="w-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-3.5">
        <h3 className="m-0 text-[15px] font-bold text-[#1A1A1A]">
          {monthName} {currentYear}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="bg-gray-50 border border-gray-200 rounded-lg w-7 h-7 cursor-pointer text-sm text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={handleNextMonth}
            className="bg-gray-50 border border-gray-200 rounded-lg w-7 h-7 cursor-pointer text-sm text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const meetingsToday = meetingMap.get(`${currentMonth}-${day}`) || [];
          const isToday = day === todayDate;

          return (
            <div
              key={day}
              title={
                meetingsToday.length
                  ? meetingsToday.map((m) => `${m.label} at ${m.time}`).join(", ")
                  : undefined
              }
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-xs
                ${isToday
                  ? "bg-gradient-to-br from-[#B179DF] to-[#85D5C8] text-white font-extrabold"
                  : meetingsToday
                    ? "font-semibold cursor-pointer hover:opacity-80"
                    : "text-[#1A1A1A] hover:bg-gray-50"
                }
              `}
              style={
                !isToday && meetingsToday.length > 0
                  ? {
                    backgroundColor:
                      meetingsToday.length === 1
                        ? meetingsToday[0].color + "18"
                        : undefined, // multiple meetings handled by dots
                    border:
                      meetingsToday.length === 1
                        ? `1px solid ${meetingsToday[0].color}44`
                        : undefined,
                  }
                  : undefined
              }
            >
              {day}
              {/* Meeting indicators */}
              {meetingsToday.length > 1 && !isToday && (
                <div className="absolute bottom-1 flex gap-[2px]">
                  {meetingsToday.slice(0, 3).map((m, i) => (
                    <span
                      key={i}
                      className="absolute bottom-0.5 w-1 h-1 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  ))}
                </div>
              )}
              {/* Single meeting dot */}
              {meetingsToday.length === 1 && !isToday && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: meetingsToday[0].color }}
                />
              )}
            </div>
          );
        })}
        {/* Trailing empty cells */}
        {Array.from({ length: trailingEmpty }).map((_, i) => (
          <div key={`trailing-${i}`} />
        ))}
      </div>
    </div>
  );
}
