import type { Project } from "../../types/types";

interface TopBarProps {
    project: Project;
}

export default function TopBar({ project }: TopBarProps) {

    return (
        <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
            
            <div>
                <div className="text-[11px] text-[#555] uppercase tracking-widest mb-1">
                    Project Dashboard
                </div>

                <h1 className="m-0 text-[22px] font-extrabold text-[#1A1A1A] tracking-tight mb-2">
                    {project.name}
                </h1>

                <div className="flex items-center gap-3 mb-1.5">
                    
                    {/* Module */}
                    <span className="text-[11px] text-gray-400">
                        {project.module}
                    </span>

                    {/* Course Name (instead of tag) */}
                    {project.courseName && (
                        <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                            {project.courseName}
                        </span>
                    )}

                    {/* Deadline (instead of dueDate) */}
                    <p className="text-[10px] text-gray-400 m-0">
                        Due{" "}
                        {project.deadline
                            ? project.deadline.toLocaleDateString()
                            : "No deadline"}
                    </p>

                </div>
            </div>
        </header>
    );
}