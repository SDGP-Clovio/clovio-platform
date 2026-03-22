import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import Avatar from '../UI/Avatar';
import {
    Calendar, ChevronLeft, ChevronRight, Clock, MapPin,
    Users, X, Check
} from 'lucide-react';
import type { Meeting } from '../../types/types';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i); // 0–23

function startOfWeek(d: Date) {
    const date = new Date(d);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
}
function addDays(d: Date, n: number) {
    const date = new Date(d);
    date.setDate(date.getDate() + n);
    return date;
}
function same(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
}
function fmt12(h: number) {
    if (h === 0)  return '12 AM';
    if (h < 12)   return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
}
function fmtTime(d: Date) {
    const h = d.getHours(), m = d.getMinutes();
    const suffix = h < 12 ? 'AM' : 'PM';
    const hh = h % 12 || 12;
    return `${hh}:${m.toString().padStart(2, '0')} ${suffix}`;
}
function fmtDate(d: Date) {
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
function toDateStr(d: Date) {
    return d.toISOString().split('T')[0];
}

const PROJECT_COLORS = [
    'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
];

/* ── New Meeting Modal ───────────────────────────────────────────────────── */
const NewMeetingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addMeeting, projects, currentUser, users } = useApp();

    const [title,    setTitle]    = useState('');
    const [date,     setDate]     = useState('');
    const [startH,   setStartH]   = useState('09');
    const [startM,   setStartM]   = useState('00');
    const [endH,     setEndH]     = useState('10');
    const [endM,     setEndM]     = useState('00');
    const [location, setLocation] = useState('');
    const [projectId, setProjectId] = useState(projects[0]?.id ?? 0);
    const [attendees, setAttendees] = useState<number[]>(currentUser?.id != null ? [currentUser.id] : []);
    const [submitError, setSubmitError] = useState<string>('');

    const toggleAttendee = (uid: number) =>
        setAttendees((prev) => prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]);

    const handleSubmit = async () => {
        if (!title || !date) return;
        setSubmitError('');
        const meeting: Meeting = {
            id: Date.now(),
            projectId,
            title,
            startTime: new Date(`${date}T${startH}:${startM}`),
            endTime:   new Date(`${date}T${endH}:${endM}`),
            attendees,
            createdBy: currentUser?.id ?? 0,
            location: location || undefined,
            status: 'scheduled',
        };
        const created = await addMeeting(meeting);
        if (!created) {
            setSubmitError('Failed to schedule meeting. Please retry.');
            return;
        }

        onClose();
    };

    const projectMembers = projects.find((p) => p.id === projectId)?.teamMembers ?? [];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-500 to-indigo-600">
                    <h3 className="text-white font-bold text-lg">Schedule a Meeting</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {submitError && (
                        <p className="text-xs text-red-600 font-medium">{submitError}</p>
                    )}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Title</label>
                        <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sprint Planning"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Project</label>
                        <select
                            value={projectId}
                            onChange={(e) => {
                                const parsedProjectId = Number(e.target.value);
                                setProjectId(Number.isFinite(parsedProjectId) ? parsedProjectId : 0);
                                setAttendees(currentUser?.id != null ? [currentUser.id] : []);
                            }}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[['Start Time', startH, setStartH, startM, setStartM], ['End Time', endH, setEndH, endM, setEndM]].map(([label, h, setH, m, setM]) => (
                            <div key={String(label)}>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{String(label)}</label>
                                <div className="flex gap-1">
                                    <select value={String(h)} onChange={(e) => (setH as (v: string) => void)(e.target.value)}
                                        className="flex-1 px-2 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                                        {ALL_HOURS.map((hh) => <option key={hh} value={hh.toString().padStart(2,'0')}>{fmt12(hh)}</option>)}
                                    </select>
                                    <select value={String(m)} onChange={(e) => (setM as (v: string) => void)(e.target.value)}
                                        className="w-16 px-2 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
                                        {['00','15','30','45'].map((mm) => <option key={mm} value={mm}>{mm}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Location (optional)</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Zoom, Library Room 3A"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Attendees</label>
                        <div className="flex flex-wrap gap-2">
                            {projectMembers.map((uid) => {
                                const u = users.find((candidate) => candidate.id === uid);
                                if (!u) return null;
                                const checked = attendees.includes(uid);
                                return (
                                    <button key={uid} onClick={() => toggleAttendee(uid)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${checked ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <Avatar name={u.name} size="sm" />
                                        {u.name.split(' ')[0]}
                                        {checked && <Check className="w-3 h-3" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={!title || !date}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Schedule Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ScheduleViewProps {
    markMode: boolean;
    showModal: boolean;
    setShowModal: (v: boolean) => void;
}

/* ══════════════════════════════════════════════════════════════════════════ */
const ScheduleView: React.FC<ScheduleViewProps> = ({ markMode, showModal, setShowModal }) => {
    const { meetings, projects, currentUser, users, weeklyOverrides, toggleHourAvailability, clearDayOverride } = useApp();

    const [weekStart, setWeekStart]  = useState(() => startOfWeek(new Date()));
    const [selected,  setSelected]   = useState<Meeting | null>(null);
    const [dragging,  setDragging]   = useState(false);
    const [dragToggle, setDragToggle] = useState(true);

    const today    = new Date();
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

    const projectColorMap = useMemo(() => {
        const map: Record<number, string> = {};
        projects.forEach((p, i) => { map[p.id] = PROJECT_COLORS[i % PROJECT_COLORS.length]; });
        return map;
    }, [projects]);

    const weekMeetings = useMemo(() => {
        const map: Record<number, Meeting[]> = {};
        for (let i = 0; i < 7; i++) map[i] = [];
        meetings.forEach((m) => weekDays.forEach((day, i) => { if (same(m.startTime, day)) map[i].push(m); }));
        return map;
    }, [meetings, weekDays]);

    const upcoming = useMemo(() =>
        [...meetings].filter((m) => m.startTime >= today).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
        [meetings]
    );

    const effectiveFreeHours = (day: Date): Set<number> => {
        const dateStr = toDateStr(day);
        if (weeklyOverrides[dateStr] !== undefined) {
            return new Set(weeklyOverrides[dateStr]);
        }
        const defaults = currentUser?.defaultAvailability ?? [];
        const slot = defaults.find((s) => s.dayOfWeek === day.getDay() && s.enabled);
        if (!slot) return new Set();
        return new Set(slot.hours);
    };

    /* Drag-to-mark helpers */
    const handleCellMouseDown = (dateStr: string, hour: number) => {
        if (!markMode) return;
        const hrs = weeklyOverrides[dateStr] ?? [];
        setDragToggle(!hrs.includes(hour));
        setDragging(true);
        toggleHourAvailability(dateStr, hour);
    };
    const handleCellMouseEnter = (dateStr: string, hour: number) => {
        if (!markMode || !dragging) return;
        const hrs = weeklyOverrides[dateStr] ?? [];
        const hasIt = hrs.includes(hour);
        if (dragToggle && !hasIt) toggleHourAvailability(dateStr, hour);
        if (!dragToggle && hasIt) toggleHourAvailability(dateStr, hour);
    };

    return (
        <div
            className="space-y-6"
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
        >
            {/* Marking mode hint */}
            {markMode && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                    <div className="w-3 h-3 rounded-sm bg-emerald-400 flex-shrink-0" />
                    <span><strong>Marking mode:</strong> Click or drag cells to mark/unmark your free time for this week. This overrides your default availability for the days you mark. <button className="underline ml-1" onClick={() => weekDays.forEach((d) => clearDayOverride(toDateStr(d)))}>Reset this week</button></span>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /> Free (default)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Free (this week)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" /> Meeting</span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

                {/* ── Weekly calendar ─────────────────────────────── */}
                <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {/* Week nav */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>
                        <span className="text-sm font-bold text-slate-700">
                            {MONTHS[weekStart.getMonth()]} {weekStart.getDate()} – {MONTHS[addDays(weekStart,6).getMonth()]} {addDays(weekStart,6).getDate()}, {weekStart.getFullYear()}
                        </span>
                        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-8 border-b border-slate-100">
                        <div className="py-2.5" />
                        {weekDays.map((day, i) => {
                            const isToday = same(day, today);
                            const hasOverride = weeklyOverrides[toDateStr(day)] !== undefined;
                            return (
                                <div key={i} className="py-2.5 text-center">
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>{DAYS[day.getDay()]}</p>
                                    <div className={`mx-auto mt-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${isToday ? 'bg-purple-600 text-white' : 'text-slate-700'}`}>
                                        {day.getDate()}
                                    </div>
                                    {hasOverride && <span className="text-[9px] text-emerald-500 font-semibold mt-0.5 block">marked</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* 24h time grid */}
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)', userSelect: 'none' }}>
                        {ALL_HOURS.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 border-b border-slate-50" style={{ minHeight: '26px' }}>
                                {/* Hour label */}
                                <div className="flex items-center justify-end pr-3">
                                    <span className="text-[10px] text-slate-300 font-medium">{fmt12(hour)}</span>
                                </div>
                                {/* Day cells */}
                                {weekDays.map((day, di) => {
                                    const dateStr = toDateStr(day);
                                    const freeHours = effectiveFreeHours(day);
                                    const isFree     = freeHours.has(hour);
                                    const isOverride = weeklyOverrides[dateStr] !== undefined && weeklyOverrides[dateStr].includes(hour);
                                    const isToday    = same(day, today);

                                    // All meetings that COVER this hour (not just start here)
                                    const coveringMeetings = weekMeetings[di].filter((m) => {
                                        const mStart = m.startTime.getHours();
                                        const mEnd   = m.endTime.getHours() + (m.endTime.getMinutes() > 0 ? 1 : 0);
                                        return hour >= mStart && hour < mEnd;
                                    });

                                    const bgClass = isOverride
                                        ? 'bg-emerald-400'
                                        : isFree
                                        ? 'bg-emerald-100'
                                        : isToday
                                        ? 'bg-purple-50/30'
                                        : '';

                                    return (
                                        <div
                                            key={di}
                                            className={`border-l border-slate-50 p-0.5 transition-colors ${markMode ? 'cursor-pointer hover:bg-emerald-200' : 'cursor-default'} ${bgClass}`}
                                            onMouseDown={() => handleCellMouseDown(dateStr, hour)}
                                            onMouseEnter={() => handleCellMouseEnter(dateStr, hour)}
                                        >
                                            {coveringMeetings.map((m) => {
                                                const color = projectColorMap[m.projectId] ?? 'bg-purple-500';
                                                const isStart = m.startTime.getHours() === hour;
                                                return isStart ? (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => !markMode && setSelected(m)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        className={`w-full text-left rounded-t-lg px-1.5 py-0.5 text-white text-[10px] font-semibold leading-tight ${color} hover:brightness-110 transition-all z-10 relative`}
                                                    >
                                                        <span className="truncate block">{m.title}</span>
                                                        <span className="opacity-80">{fmtTime(m.startTime)}–{fmtTime(m.endTime)}</span>
                                                    </button>
                                                ) : (
                                                    // Continuation strip for hours after the start
                                                    <button
                                                        key={m.id}
                                                        onClick={() => !markMode && setSelected(m)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        className={`w-full h-full rounded-none ${color} opacity-70 hover:opacity-100 transition-all z-10 relative block`}
                                                        style={{ minHeight: '22px' }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Upcoming sidebar ─────────────────────────────── */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700">Upcoming</h3>
                            <p className="text-xs text-slate-400">{upcoming.length} meeting{upcoming.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                            {upcoming.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">No upcoming meetings</p>
                                </div>
                            ) : upcoming.map((m) => {
                                const color = projectColorMap[m.projectId] ?? 'bg-purple-500';
                                const proj  = projects.find((p) => p.id === m.projectId);
                                return (
                                    <button key={m.id} onClick={() => setSelected(m)} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-2.5">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${color}`} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 truncate">{m.title}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(m.startTime)}</p>
                                                <p className="text-[10px] text-slate-400">{fmtTime(m.startTime)} – {fmtTime(m.endTime)}</p>
                                                {proj && <p className="text-[10px] text-purple-500 font-medium mt-0.5 truncate">{proj.name}</p>}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting detail popup */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className={`px-6 py-5 ${projectColorMap[selected.projectId] ?? 'bg-purple-500'}`}>
                            <div className="flex items-start justify-between">
                                <h3 className="text-white font-bold text-lg pr-4">{selected.title}</h3>
                                <button onClick={() => setSelected(null)} className="p-1 rounded-lg bg-white/20 text-white hover:bg-white/30 flex-shrink-0"><X className="w-4 h-4" /></button>
                            </div>
                            <p className="text-white/80 text-sm mt-1">{fmtDate(selected.startTime)}</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {fmtTime(selected.startTime)} – {fmtTime(selected.endTime)}
                            </div>
                            {selected.location && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {selected.location}
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div className="flex flex-wrap gap-2">
                                    {selected.attendees.map((uid) => {
                                        const u = users.find((candidate) => candidate.id === uid);
                                        return u ? (
                                            <div key={uid} className="flex items-center gap-1.5">
                                                <Avatar name={u.name} size="sm" />
                                                <span className="text-xs text-slate-600">{u.name.split(' ')[0]}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                            {selected.description && <p className="text-sm text-slate-500 pt-1">{selected.description}</p>}
                        </div>
                    </div>
                </div>
            )}

            {showModal && <NewMeetingModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default ScheduleView;
