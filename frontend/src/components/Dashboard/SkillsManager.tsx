import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import { Plus, X } from 'lucide-react';

const SkillsManager: React.FC = () => {
    const { currentUser, addSkill, removeSkill, addLearningGoal, removeLearningGoal } = useApp();
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [showGoalInput, setShowGoalInput] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [newGoal, setNewGoal] = useState('');

    if (!currentUser) return null;

    const allSkills = [
        'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL',
        'UI Design', 'UX Research', 'Data Analysis', 'Machine Learning',
        'Backend Development', 'Frontend Development', 'Database Design',
        'API Development', 'DevOps', 'Testing', 'Documentation',
    ];

    const userSkills = currentUser.skills || [];
    const learningGoals = currentUser.learningGoals || [];
    const availableSkills = allSkills.filter((skill) => !userSkills.includes(skill) && !learningGoals.includes(skill));

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            addSkill(newSkill.trim());
            setNewSkill('');
            setShowSkillInput(false);
        }
    };

    const handleAddGoal = () => {
        if (newGoal.trim()) {
            addLearningGoal(newGoal.trim());
            setNewGoal('');
            setShowGoalInput(false);
        }
    };

    const handleQuickAddSkill = (skill: string) => {
        addSkill(skill);
    };

    const handleQuickAddGoal = (goal: string) => {
        addLearningGoal(goal);
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">My Skills & Learning Goals</h3>

            {/* Current Skills */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-600">Current Skills</h4>
                    <button
                        onClick={() => setShowSkillInput(!showSkillInput)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add Skill
                    </button>
                </div>

                {/* Add Skill Input */}
                {showSkillInput && (
                    <div className="mb-3 flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Enter skill name..."
                            className="flex-1 px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            autoFocus
                        />
                        <button
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => {
                                setShowSkillInput(false);
                                setNewSkill('');
                            }}
                            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {userSkills.length > 0 ? (
                        userSkills.map((skill) => (
                            <div
                                key={skill}
                                className="group flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                                {skill}
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-purple-900"
                                    title="Remove skill"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 italic">No skills added yet</p>
                    )}
                </div>
            </div>

            {/* Learning Goals */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-600">Learning Goals</h4>
                    <button
                        onClick={() => setShowGoalInput(!showGoalInput)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add Goal
                    </button>
                </div>

                {/* Add Goal Input */}
                {showGoalInput && (
                    <div className="mb-3 flex gap-2">
                        <input
                            type="text"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                            placeholder="Enter learning goal..."
                            className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            autoFocus
                        />
                        <button
                            onClick={handleAddGoal}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => {
                                setShowGoalInput(false);
                                setNewGoal('');
                            }}
                            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {learningGoals.length > 0 ? (
                        learningGoals.map((goal) => (
                            <div
                                key={goal}
                                className="group flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                                {goal}
                                <button
                                    onClick={() => removeLearningGoal(goal)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-blue-900"
                                    title="Remove learning goal"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 italic">No learning goals set</p>
                    )}
                </div>
            </div>

            {/* Suggested Skills */}
            {availableSkills.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3">Quick Add Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableSkills.slice(0, 5).map((skill) => (
                            <button
                                key={skill}
                                onClick={() => handleQuickAddSkill(skill)}
                                className="group px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-sm hover:bg-purple-50 hover:text-purple-600 border border-slate-200 hover:border-purple-300 transition-all"
                                title="Add as skill"
                            >
                                <span className="flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    {skill}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                        💡 Click a suggestion to add as a skill, or use the "+ Add Skill" button to add custom skills
                    </p>
                </div>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                    <strong>Tip:</strong> Skills help AI assign tasks that match your expertise, while learning goals ensure you work on tasks that help you grow.
                </p>
            </div>
        </Card>
    );
};

export default SkillsManager;
