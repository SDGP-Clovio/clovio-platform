import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Sparkles, Save,
    AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../types/types';
import MemberSearch from './MemberSearch';

interface Props { project: Project; }

/** Convert a Date or undefined → "YYYY-MM-DD" for <input type="date"> */
const toDateStr = (d?: Date | string): string => {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return '';
    const y  = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dy = String(date.getDate()).padStart(2, '0');
    return `${y}-${mo}-${dy}`;
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {children}
    </label>
);
const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all';

/* ═══════════════════════════════════════════════════════════════════════════ */
const ProjectSettings: React.FC<Props> = ({ project }) => {
    const navigate = useNavigate();
    const { users, updateProject, deleteProject } = useApp();

    const [name,        setName]        = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [courseName,  setCourseName]  = useState(project.courseName ?? '');
    const [deadline,    setDeadline]    = useState(toDateStr(project.deadline));
    const [supervisorId, setSupervisorId] = useState(project.supervisorId);
    const [members,     setMembers]     = useState<number[]>(project.teamMembers);
    const [saved,       setSaved]       = useState(false);
    const [showDelete,  setShowDelete]  = useState(false);
    const [isSaving,    setIsSaving]    = useState(false);
    const [saveError,   setSaveError]   = useState('');
    const [isDeleting,  setIsDeleting]  = useState(false);

    const allStudents = users.filter((u) => u.role !== 'supervisor');
    const allSupervisors = users.filter((u) => u.role === 'supervisor');

    const save = async () => {
        setSaveError('');
        setIsSaving(true);

        const success = await updateProject(project.id, {
            name, description, courseName,
            deadline: deadline ? new Date(deadline) : undefined,
            supervisorId,
            teamMembers: members,
        });

        setIsSaving(false);

        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
            return;
        }

        setSaveError('Failed to save project changes. Please try again.');
    };

    const handleDeleteProject = async () => {
        setSaveError('');
        setIsDeleting(true);
        const success = await deleteProject(project.id);
        setIsDeleting(false);

        if (!success) {
            setSaveError('Failed to delete project. Please refresh and try again.');
            return;
        }

        navigate('/dashboard');
    };

    return (
        /* Two-column grid that fills the full content area */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-10 items-start">

            {/* ══ LEFT COLUMN ══════════════════════════════════════════════ */}
            <div className="space-y-5">

                {/* General Info */}
                <div className="bg-white rounded-2xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">General Info</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Basic project details</p>
                        </div>
                        <button
                            onClick={save}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSaving
                                    ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                                    : saved
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-md'
                            }`}
                        >
                            {isSaving
                                ? <><Save className="w-3.5 h-3.5" /> Saving...</>
                                : saved
                                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</>
                                : <><Save className="w-3.5 h-3.5" /> Save</>}
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <Label>Project Name</Label>
                            <input
                                type="text"
                                title="Project name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <textarea
                                title="Project description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className={`${inputCls} resize-none`}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Course</Label>
                                <input
                                    type="text"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    placeholder="e.g. Software Engineering"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <Label>Deadline</Label>
                                <input
                                    type="date"
                                    title="Project deadline"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <Label>Supervisor</Label>
                                <select
                                    value={supervisorId ?? ''}
                                    onChange={(e) => {
                                        if (e.target.value === '') {
                                            setSupervisorId(null);
                                            return;
                                        }
                                        const parsed = Number(e.target.value);
                                        setSupervisorId(Number.isFinite(parsed) ? parsed : null);
                                    }}
                                    title="Project supervisor"
                                    className={inputCls}
                                >
                                    {allSupervisors.length === 0 ? (
                                        <option value="">No supervisor available</option>
                                    ) : (
                                        allSupervisors.map((supervisor) => (
                                            <option key={supervisor.id} value={supervisor.id}>
                                                {supervisor.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                        {allSupervisors.length === 0 && (
                            <p className="text-xs text-amber-600">No supervisor account exists yet. Create one to assign supervision.</p>
                        )}
                        {saveError && (
                            <p className="text-xs text-red-600">{saveError}</p>
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl border border-red-100">
                    <div className="px-6 py-4 border-b border-red-100">
                        <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
                        <p className="text-xs text-red-400 mt-0.5">These actions cannot be undone</p>
                    </div>
                    <div className="p-6">
                        {!showDelete ? (
                            <button
                                onClick={() => setShowDelete(true)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Project
                            </button>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800">Delete "{project.name}"?</p>
                                        <p className="text-xs text-red-600 mt-1">
                                            All tasks, meetings, and data will be permanently removed. This cannot be undone.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={handleDeleteProject}
                                        disabled={isDeleting}
                                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                                    </button>
                                    <button
                                        onClick={() => setShowDelete(false)}
                                        disabled={isDeleting}
                                        className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>{/* end left column */}

            {/* ══ RIGHT COLUMN ═════════════════════════════════════════════ */}
            <div className="space-y-5">

                {/* Team Members */}
                <div className="bg-white rounded-2xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">Team Members</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {members.length} member{members.length !== 1 ? 's' : ''} on this project
                        </p>
                    </div>
                    <div className="p-5">
                        <MemberSearch
                            allUsers={allStudents}
                            selectedIds={members}
                            onChange={(ids) => {
                                setMembers(ids);
                            }}
                        />
                    </div>
                </div>

                {/* AI Task Breakdown Wizard */}
                <div className="bg-white rounded-2xl border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">Task Breakdown</h3>
                        <p className="text-xs text-slate-400 mt-0.5">AI-powered task generation</p>
                    </div>
                    <div className="p-6 flex items-start gap-5">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">AI Task Breakdown Wizard</p>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Describe your project goals and the wizard generates a structured task list —
                                priorities, time estimates, and smart assignments based on team skills.
                            </p>
                            <p className="mt-4 text-[11px] text-slate-500">
                                Use the Tasks tab and open AI Task Distribution to generate and review milestones and tasks.
                            </p>
                        </div>
                    </div>
                </div>

            </div>{/* end right column */}

        </div>
    );
};

export default ProjectSettings;
