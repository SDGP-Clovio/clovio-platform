import type { Meeting } from "../types/index";


interface UpcomingMeetingsProps {
  meetings: Meeting[];
  today?: number;
}

export default function UpcomingMeetings({
  meetings,
  today = 2,
}: UpcomingMeetingsProps) {
  const upcoming = meetings.filter((m) => m.day >= today).slice(0, 3);

  return (
    <div>
      <h3 className="m-0 mb-3 text-[15px] font-bold text-[#1A1A1A]">
        Upcoming Meetings
      </h3>
      <div className="flex flex-col gap-2.5">
        {upcoming.map((meeting, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
          >
            {/* Date badge */}
            <div
              className="w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
              style={{ backgroundColor: meeting.color + "22" }}
            >
              <span
                className="text-[13px] font-extrabold leading-none"
                style={{ color: meeting.color }}
              >
                {meeting.day}
              </span>
              <span
                className="text-[8px] font-semibold"
                style={{ color: meeting.color }}
              >
                MAR
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#1A1A1A] m-0">
                {meeting.label}
              </p>
              <p className="text-[11px] text-gray-400 m-0">{meeting.time}</p>
            </div>

            {/* Colour dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: meeting.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
