import type { Project } from "../types/index";
import CircularProgress from "./CircularProgress";

interface ProjectCardProps {
  project: Project;
}

function FairnessBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "#85D5C8" : value >= 60 ? "#F59E0B" : "#EF4444";
  const textColor =
    value >= 80
      ? "text-[#85D5C8]"
      : value >= 60
      ? "text-[#F59E0B]"
      : "text-[#EF4444]";

  return (
    <div className="flex items-center gap-2">
      <span className={`text-[11px] font-bold min-w-[28px] ${textColor}`}>
        {value}%
      </span>
    </div>
  );
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const visibleMembers = project.members.slice(0, 4);
  const extraMembers = project.members.length - 4;

  return (
    <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-[0_6px_24px_rgba(177,121,223,0.15)] hover:-translate-y-px transition-all duration-200">
      {/* Circular progress ring */}
            <div className="relative flex-shrink-0">
              <CircularProgress value={project.progress} />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-[#1A1A1A]">
                {project.progress}%
              </div>
            </div>
      
      {/* Main info */}
      <div className="flex-1 min-w-0">
        {/* Name + status badge */}
        <div className="flex items-center gap-2.5 mb-1">
          <h3 className="m-0 text-[15px] font-bold text-[#1A1A1A] truncate">
            {project.name}
          </h3>
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              color: project.statusColor,
              backgroundColor: project.statusBg,
            }}
          >
            {project.status}
          </span>
        </div>

        {/* Module + tag */}
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[11px] text-gray-400">{project.module}</span>
          <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
            {project.tag}
          </span>
        </div>
        <div className="text-[#555] text-[13px] leading-relaxed mb-2">
          {project.description}
        </div>
        {/* Fairness */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 flex-shrink-0">Fairness:</span>
          <FairnessBar value={project.fairness} />
        </div>
    </div>
    {/* Member avatar stack */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div className="flex">
          {visibleMembers.map((member, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                backgroundColor: member.color,
                marginLeft: i === 0 ? 0 : -8,
                zIndex: visibleMembers.length - i,
              }}
            >
              {member.initial}
            </div>
          ))}
          {extraMembers > 0 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500"
              style={{ marginLeft: -8 }}
            >
              +{extraMembers}
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-400">
          {project.members.length} members
        </span>
      </div>
      {/* Due date */}
      <div className="text-center flex-shrink-0">
        <p className="text-xs font-bold text-[#1A1A1A] m-0">{project.dueDate}</p>
        <p className="text-[10px] text-gray-400 m-0">Due date</p>
      </div>
    </div>
  );
}
