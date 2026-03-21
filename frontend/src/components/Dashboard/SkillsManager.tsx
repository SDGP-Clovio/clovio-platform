import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import { Plus, X } from 'lucide-react';

const SkillsManager: React.FC = () => {
    const { currentUser, addSkill, removeSkill } = useApp();
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');

    if (!currentUser) return null;

    const allSkills = [
        'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL',
        'UI Design', 'UX Research', 'Data Analysis', 'Machine Learning',
        'Backend Development', 'Frontend Development', 'Database Design',
        'API Development', 'DevOps', 'Testing', 'Documentation',
    ];

    const userSkills = currentUser.skills || [];
    const userSkillNames = userSkills.map(skill => skill.name);
    const availableSkills = allSkills.filter((skill) => !userSkillNames.includes(skill));

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            addSkill({ name: newSkill.trim(), level: newSkillLevel });
            setNewSkill('');
            setShowSkillInput(false);
        }
    };

    const handleQuickAddSkill = (skillName: string) => {
        addSkill({ name: skillName, level: 'beginner' });
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">My Skills</h3>

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
                    <div className="mb-3 space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                placeholder="Enter skill name..."
                                className="flex-1 px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                                autoFocus
                            />
                            <select
                                value={newSkillLevel}
                                onChange={(e) => setNewSkillLevel(e.target.value as any)}
                                className="px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
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
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {userSkills.length > 0 ? (
                        userSkills.map((skill) => (
                            <div
                                key={skill.name}
                                className="group flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                                <span>{skill.name}</span>
                                <span className="text-xs opacity-75">({skill.level})</span>
                                <button
                                    onClick={() => removeSkill(skill.name)}
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

            {/* Suggested Skills */}
            {availableSkills.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3">Quick Add Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableSkills.slice(0, 5).map((skillName) => (
                            <button
                                key={skillName}
                                onClick={() => handleQuickAddSkill(skillName)}
                                className="group px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-sm hover:bg-purple-50 hover:text-purple-600 border border-slate-200 hover:border-purple-300 transition-all"
                                title="Add as skill"
                            >
                                <span className="flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    {skillName}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                        💡 Click a suggestion to add as a beginner skill, or use the "+ Add Skill" button for custom skills and levels
                    </p>
                </div>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                    <strong>Tip:</strong> Skills help AI assign tasks that match your expertise. Add your skill level to get more accurate assignments.
                </p>
            </div>
        </Card>
    );
};

export default SkillsManager;
