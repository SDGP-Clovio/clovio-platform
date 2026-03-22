import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/types';
import Avatar from '../UI/Avatar';
import { getUserById } from '../../data/mockData';
import { Calendar } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const navigate = useNavigate();
    const teamMembers = project.teamMembers.map((id) => getUserById(id)).filter((u) => u !== undefined);

    // Calculate progress based on status
    const getProgress = () => {
        if (project.status === 'completed') return 100;
        if (project.status === 'archived') return 100;
        const daysSinceStart = Math.floor((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = project.deadline
            ? Math.floor((new Date(project.deadline).getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 90;
        return Math.min(Math.round((daysSinceStart / totalDays) * 100), 90);
    };

    const progress = getProgress();

    // Progress bar color based on status
    const getProgressColor = () => {
        if (project.status === 'completed') return 'bg-green-500';
        if (progress >= 75) return 'bg-purple-500';
        if (progress >= 50) return 'bg-blue-500';
        return 'bg-orange-500';
    };

    return (
        <div
            onClick={() => navigate(`/project/${project.id}`)}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer group"
        >
            {/* Header with Date */}
            <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-slate-400 font-medium">
                    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {project.status === 'completed' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        ✓ Completed
                    </span>
                )}
            </div>

            {/* Project Title */}
            <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                {project.name}
            </h3>

            {/* Description - Optional */}
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {project.description}
            </p>

            {/* Progress Section */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Progress</span>
                    <span className="text-sm font-bold text-slate-800">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                        className={`${getProgressColor()} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Footer with Team & Badge */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {/* Team Avatars */}
                <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                        {teamMembers.slice(0, 3).map((member) => (
                            <Avatar
                                key={member!.id}
                                name={member!.name}
                                size="sm"
                                className="ring-2 ring-white"
                            />
                        ))}
                        {teamMembers.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700 ring-2 ring-white">
                                +{teamMembers.length - 3}
                            </div>
                        )}
                    </div>
                </div>

                {/* Deadline Badge - Taskify Style */}
                {project.deadline && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded text-xs font-medium text-orange-700">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
