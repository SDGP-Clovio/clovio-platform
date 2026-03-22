import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Avatar from '../UI/Avatar';
import { User, Briefcase, Plus, X, Lightbulb, Clock, Pencil, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Skill, SkillLevel, DayAvailability } from '../../types/types';

const SUGGESTED_SKILLS = [
    'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL',
    'UI Design', 'UX Research', 'Data Analysis', 'Machine Learning',
    'Backend Development', 'Frontend Development', 'Database Design',
    'API Development', 'DevOps', 'Testing', 'Documentation',
];

const LEVELS: { value: SkillLevel; label: string; color: string; dot: string }[] = [
    { value: 'beginner',     label: 'Beginner',     color: 'bg-slate-100 text-slate-500 border-slate-200',    dot: 'bg-slate-400' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-600 border-blue-200',       dot: 'bg-blue-500' },
    { value: 'advanced',     label: 'Advanced',     color: 'bg-indigo-100 text-indigo-600 border-indigo-200', dot: 'bg-indigo-500' },
    { value: 'expert',       label: 'Expert',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
];

const levelMeta = (level: SkillLevel) => LEVELS.find((l) => l.value === level) ?? LEVELS[0];

/* ── Section wrapper ─────────────────────────────────────────────────────── */
const Section: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> =
    ({ icon, title, subtitle, children }) => (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);
const fmt12 = (h: number) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

// Default: Mon-Fri 9-17
const DEFAULT_SLOTS: DayAvailability[] = DAY_NAMES.map((_, i) => ({
    dayOfWeek: i,
    hours: (i >= 1 && i <= 5) ? Array.from({ length: 8 }, (_, k) => k + 9) : [],
    enabled: i >= 1 && i <= 5,
}));

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/* ══════════════════════════════════════════════════════════════════════════ */
const SettingsPanel: React.FC = () => {
    const {
        currentUser,
        updateCurrentUserName,
        addSkill,
        removeSkill,
        updateSkillLevel,
        updateDefaultAvailability,
    } = useApp();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: '' });

    const [skillInput, setSkillInput] = useState('');
    const [newLevel, setNewLevel] = useState<SkillLevel>('beginner');
    const [showInput, setShowInput] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [saveMessage, setSaveMessage] = useState('');
    const saveResetTimerRef = useRef<number | null>(null);

    const setSaving = (message: string) => {
        if (saveResetTimerRef.current) {
            window.clearTimeout(saveResetTimerRef.current);
            saveResetTimerRef.current = null;
        }
        setSaveState('saving');
        setSaveMessage(message);
    };

    const setSavedState = (message: string) => {
        if (saveResetTimerRef.current) {
            window.clearTimeout(saveResetTimerRef.current);
        }
        setSaveState('saved');
        setSaveMessage(message);
        saveResetTimerRef.current = window.setTimeout(() => {
            setSaveState('idle');
            setSaveMessage('');
        }, 2400);
    };

    const setErrorState = (message: string) => {
        if (saveResetTimerRef.current) {
            window.clearTimeout(saveResetTimerRef.current);
            saveResetTimerRef.current = null;
        }
        setSaveState('error');
        setSaveMessage(message);
    };

    useEffect(() => {
        return () => {
            if (saveResetTimerRef.current) {
                window.clearTimeout(saveResetTimerRef.current);
            }
        };
    }, []);

    // Availability — local grid state: dayIndex -> Set of free hours
    const [grid, setGrid] = useState<Record<number, Set<number>>>(() => {
        const initial: Record<number, Set<number>> = {};
        const src = currentUser?.defaultAvailability ?? DEFAULT_SLOTS;
        src.forEach((s) => { initial[s.dayOfWeek] = new Set(s.hours); });
        return initial;
    });
    const [dragging, setDragging]   = useState(false);
    const [dragVal,  setDragVal]    = useState(true); // true=adding, false=removing

    const saveGrid = async (updated: Record<number, Set<number>>) => {
        setGrid(updated);
        const slots: DayAvailability[] = DAY_NAMES.map((_, i) => ({
            dayOfWeek: i,
            hours: [...(updated[i] ?? new Set())].sort((a, b) => a - b),
            enabled: (updated[i]?.size ?? 0) > 0,
        }));

        setSaving('Saving weekly availability...');
        const persisted = await updateDefaultAvailability(slots);
        if (persisted) {
            setSavedState('Weekly availability saved');
        } else {
            setErrorState('Failed to save weekly availability. Please retry.');
        }
    };

    const toggleCell = (day: number, hour: number, forceVal?: boolean) => {
        const next = { ...grid, [day]: new Set(grid[day] ?? []) };
        const adding = forceVal ?? !next[day].has(hour);
        if (adding) next[day].add(hour); else next[day].delete(hour);
        void saveGrid(next);
    };

    const clearDay = (day: number) => {
        void saveGrid({ ...grid, [day]: new Set() });
    };

    const markedHours = useMemo(
        () => Object.values(grid).reduce((sum, s) => sum + s.size, 0),
        [grid]
    );


    if (!currentUser) return null;

    const userSkills: Skill[] = currentUser.skills ?? [];
    const suggested = SUGGESTED_SKILLS.filter(
        (s) => !userSkills.some((us) => us.name === s)
    );

    const handleSaveProfile = async () => {
        const nextName = editForm.name.trim();
        if (!nextName) return;

        setSaving('Saving profile...');
        const saved = await updateCurrentUserName(nextName);
        if (saved) {
            setIsEditingProfile(false);
            setSavedState('Profile saved');
        } else {
            setErrorState('Failed to save profile. Please retry.');
        }
    };

    const handleAdd = async () => {
        if (!skillInput.trim()) return;

        setSaving('Saving skills...');
        const saved = await addSkill({ name: skillInput.trim(), level: newLevel });
        if (!saved) {
            setErrorState('Failed to save skill. Please retry.');
            return;
        }

        setSkillInput('');
        setNewLevel('beginner');
        setShowInput(false);
        setSavedState('Skills updated');
    };

    return (
        <div className="space-y-4">
            {saveState !== 'idle' && (
                <div
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                        saveState === 'saving'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : saveState === 'saved'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {saveState === 'saving' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saveState === 'saved' ? (
                        <CheckCircle2 className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{saveMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

            {/* ── Left: Profile ──────────────────────────────────────────── */}
            <div className="xl:col-span-1 space-y-6">
                <Section icon={<User className="w-4 h-4" />} title="Profile" subtitle="Your account information">
                    <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-slate-100">
                        <Avatar name={currentUser.name} size="lg" online />
                        <p className="mt-3 text-lg font-bold text-slate-800">{currentUser.name}</p>
                        <p className="text-sm text-slate-500">{currentUser.email}</p>
                        <span className="mt-2 inline-block text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full capitalize">
                            {currentUser.role}
                        </span>
                    </div>
                    <div className="space-y-0 divide-y divide-slate-50">
                        <div className="flex items-center justify-between py-3">
                            <span className="text-xs text-slate-400 font-medium">Full Name</span>
                            {isEditingProfile ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile(); if (e.key === 'Escape') setIsEditingProfile(false); }}
                                        autoFocus
                                        className="text-sm text-slate-700 font-semibold border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-[150px] text-right"
                                    />
                                    <button onClick={handleSaveProfile} className="text-emerald-600 p-1 hover:bg-emerald-50 rounded transition-colors"><Check className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 p-1 hover:bg-slate-50 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <span className="text-sm text-slate-700 font-semibold capitalize">{currentUser.name}</span>
                                    <button onClick={() => { setEditForm({ name: currentUser.name }); setIsEditingProfile(true); }} className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-xs text-slate-400 font-medium">Email</span>
                            <span className="text-sm text-slate-700 font-semibold">{currentUser.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-xs text-slate-400 font-medium">Role</span>
                            <span className="text-sm text-slate-700 font-semibold capitalize">{currentUser.role}</span>
                        </div>
                    </div>
                </Section>

                {/* AI Tip */}
                <div className="flex items-start gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl px-5 py-4">
                    <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                        <strong>AI Tip:</strong> Skill levels help the AI assign tasks suited to your current expertise — Experts get lead tasks, Beginners get growth opportunities.
                    </p>
                </div>
            </div>

            {/* ── Right: Skills ──────────────────────────────────────────── */}
            <div className="xl:col-span-2">
                <Section
                    icon={<Briefcase className="w-4 h-4" />}
                    title="Skills"
                    subtitle={`${userSkills.length} skill${userSkills.length !== 1 ? 's' : ''}`}
                >
                    {/* Level legend */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {LEVELS.map((l) => (
                            <span key={l.value} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${l.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
                                {l.label}
                            </span>
                        ))}
                    </div>

                    {/* Add button */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-slate-400">Hover a skill to remove it or change its level</p>
                        <button
                            onClick={() => setShowInput(true)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Skill
                        </button>
                    </div>

                    {/* Inline add form */}
                    {showInput && (
                        <div className="flex flex-wrap gap-2 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <input
                                autoFocus
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); if (e.key === 'Escape') setShowInput(false); }}
                                placeholder="Skill name..."
                                className="flex-1 min-w-32 px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            {/* Level picker */}
                            <select
                                value={newLevel}
                                onChange={(e) => setNewLevel(e.target.value as SkillLevel)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                                {LEVELS.map((l) => (
                                    <option key={l.value} value={l.value}>{l.label}</option>
                                ))}
                            </select>
                            <button onClick={() => void handleAdd()} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
                            <button onClick={() => { setShowInput(false); setSkillInput(''); }} className="px-4 py-2 bg-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
                        </div>
                    )}

                    {/* Skill cards */}
                    <div className="space-y-2 mb-5">
                        {userSkills.length === 0 && (
                            <p className="text-sm text-slate-400 italic py-2">No skills yet — add your first one above!</p>
                        )}
                        {userSkills.map((skill) => {
                            const meta = levelMeta(skill.level);
                            return (
                                <div key={skill.name} className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm bg-white transition-all">
                                    {/* Level dot */}
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />

                                    {/* Name */}
                                    <span className="flex-1 text-sm font-semibold text-slate-700">{skill.name}</span>

                                    {/* Level selector (visible on hover) */}
                                    <select
                                        value={skill.level}
                                        onChange={async (e) => {
                                            setSaving('Saving skills...');
                                            const saved = await updateSkillLevel(skill.name, e.target.value as SkillLevel);
                                            if (saved) {
                                                setSavedState('Skills updated');
                                            } else {
                                                setErrorState('Failed to save skill level. Please retry.');
                                            }
                                        }}
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${meta.color}`}
                                    >
                                        {LEVELS.map((l) => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>

                                    {/* Remove */}
                                    <button
                                        onClick={async () => {
                                            setSaving('Saving skills...');
                                            const saved = await removeSkill(skill.name);
                                            if (saved) {
                                                setSavedState('Skills updated');
                                            } else {
                                                setErrorState('Failed to remove skill. Please retry.');
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-300"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Suggestions */}
                    {suggested.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick add — defaults to Beginner</p>
                            <div className="flex flex-wrap gap-2">
                                {suggested.slice(0, 9).map((s) => (
                                    <button
                                        key={s}
                                        onClick={async () => {
                                            setSaving('Saving skills...');
                                            const saved = await addSkill({ name: s, level: 'beginner' });
                                            if (saved) {
                                                setSavedState('Skills updated');
                                            } else {
                                                setErrorState('Failed to save skill. Please retry.');
                                            }
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-xs font-medium border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />{s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
                {/* Availability Section — click/drag grid */}
                <Section
                    icon={<Clock className="w-4 h-4" />}
                    title="Default Weekly Availability"
                    subtitle={`${markedHours} hour${markedHours !== 1 ? 's' : ''} marked`}
                >
                    <p className="text-xs text-slate-400 mb-3">
                        Click or drag cells to mark your recurring free time. Used in the Schedule tab unless you've set a specific week override.
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
                            <span className="text-xs text-slate-500">Free</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 inline-block" />
                            <span className="text-xs text-slate-500">Busy</span>
                        </div>
                        <button
                            onClick={() => void saveGrid(Object.fromEntries(DAY_NAMES.map((_, i) => [i, new Set<number>()])))}
                            className="ml-auto text-xs text-slate-400 hover:text-red-500 underline transition-colors"
                        >Clear all</button>
                    </div>

                    {/* Grid */}
                    <div
                        className="overflow-auto rounded-xl border border-slate-100"
                        onMouseUp={() => setDragging(false)}
                        onMouseLeave={() => setDragging(false)}
                        style={{ userSelect: 'none' }}
                    >
                        {/* Header row */}
                        <div className="grid sticky top-0 z-10 bg-white border-b border-slate-100" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
                            <div />
                            {DAY_NAMES.map((d, i) => (
                                <div key={i} className="py-2 text-center">
                                    <p className="text-xs font-bold text-slate-500">{d}</p>
                                    <button
                                        onClick={() => clearDay(i)}
                                        className="text-[9px] text-slate-300 hover:text-red-400 transition-colors"
                                    >clear</button>
                                </div>
                            ))}
                        </div>

                        {/* Hour rows */}
                        <div className="max-h-72 overflow-y-auto">
                            {ALL_HOURS.map((hour) => (
                                <div key={hour} className="grid border-b border-slate-50 last:border-b-0" style={{ gridTemplateColumns: '40px repeat(7, 1fr)', minHeight: '22px' }}>
                                    {/* Hour label */}
                                    <div className="flex items-center justify-end pr-2">
                                        <span className="text-[9px] text-slate-300 font-medium">{fmt12(hour)}</span>
                                    </div>
                                    {/* Day cells */}
                                    {DAY_NAMES.map((_, di) => {
                                        const isFree = grid[di]?.has(hour) ?? false;
                                        return (
                                            <div
                                                key={di}
                                                className={`border-l border-slate-50 cursor-pointer transition-colors
                                                    ${isFree ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-white hover:bg-emerald-100'}
                                                `}
                                                onMouseDown={() => {
                                                    const adding = !isFree;
                                                    setDragVal(adding);
                                                    setDragging(true);
                                                    toggleCell(di, hour, adding);
                                                }}
                                                onMouseEnter={() => {
                                                    if (!dragging) return;
                                                    const has = grid[di]?.has(hour) ?? false;
                                                    if (dragVal && !has) toggleCell(di, hour, true);
                                                    if (!dragVal && has) toggleCell(di, hour, false);
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    </div>
    );
};

export default SettingsPanel;
