import React, { useState, useMemo } from 'react';
import { Users, Calendar, Clock, CheckCircle2, AlertTriangle, Plus, X, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockAvailability } from '../../data/mockData';
import Avatar from '../UI/Avatar';
import type { AvailabilitySlot, Meeting } from '../../types/types';

interface Props {
    projectId: number;
    projectMemberIds: number[];
}

interface FreeSlot {
    dayOfWeek: number;           // 1-5
    startHour: number;
    endHour: number;
    availableIds: number[];
    missingIds: number[];
    allPresent: boolean;
}

interface ScheduleForm {
    title: string;
    description: string;
    location: string;
    date: string;      // YYYY-MM-DD
    startHour: number;
    endHour: number;
}

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const fmt12 = (h: number) => {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}:00 ${period}`;
};

/** Return next occurrence of dayOfWeek (1=Mon…5=Fri) from today, formatted in LOCAL time */
const nextDateForDay = (dow: number): string => {
    const today = new Date();
    const todayDow = today.getDay() === 0 ? 7 : today.getDay(); // 1-7
    let delta = dow - todayDow;
    if (delta <= 0) delta += 7;
    const d = new Date(today);
    d.setDate(today.getDate() + delta);
    // Format in LOCAL time (avoid toISOString which uses UTC and causes off-by-one in non-UTC timezones)
    const y  = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${dy}`;
};

const MeetingScheduler: React.FC<Props> = ({ projectId, projectMemberIds }) => {
    const { users, meetings, addMeeting, currentUser } = useApp();

    // Only show project members
    const members = useMemo(
        () => users.filter((u) => projectMemberIds.includes(u.id)),
        [users, projectMemberIds]
    );

    const [selectedIds, setSelectedIds] = useState<number[]>(projectMemberIds);
    const [showForm, setShowForm] = useState(false);
    const [prefillSlot, setPrefillSlot] = useState<FreeSlot | null>(null);
    const [form, setForm] = useState<ScheduleForm>({
        title: '',
        description: '',
        location: '',
        date: nextDateForDay(1),
        startHour: 10,
        endHour: 11,
    });
    const [success, setSuccess] = useState(false);

    // ── Selection helpers ────────────────────────────────────────────────────
    const allSelected = selectedIds.length === members.length;
    const toggleAll = () => setSelectedIds(allSelected ? [] : members.map((m) => m.id));
    const toggleMember = (id: number) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    // ── Free-slot calculation ─────────────────────────────────────────────────
    const freeSlots = useMemo<FreeSlot[]>(() => {
        if (selectedIds.length === 0) return [];

        // For each day 1-5, find the union of hour ranges for each selected user
        const slots: FreeSlot[] = [];

        for (let day = 1; day <= 5; day++) {
            // Gather each selected user's slots for this day
            const byUser: Record<number, AvailabilitySlot[]> = {};
            for (const uid of selectedIds) {
                byUser[uid] = mockAvailability.filter(
                    (s) => s.userId === uid && s.dayOfWeek === day
                );
            }

            // Build an hour-by-hour grid (hours 8-20)
            for (let startH = 8; startH < 20; startH++) {
                const availableIds: number[] = [];
                const missingIds: number[] = [];

                for (const uid of selectedIds) {
                    const free = byUser[uid].some(
                        (s) => s.startHour <= startH && startH < s.endHour
                    );
                    if (free) availableIds.push(uid);
                    else missingIds.push(uid);
                }

                if (availableIds.length >= 2) {
                    // Try to merge consecutive hours
                    const last = slots[slots.length - 1];
                    const sameGroup =
                        last &&
                        last.dayOfWeek === day &&
                        last.endHour === startH &&
                        last.availableIds.join(',') === availableIds.join(',');

                    if (sameGroup) {
                        last.endHour = startH + 1;
                    } else {
                        slots.push({
                            dayOfWeek: day,
                            startHour: startH,
                            endHour: startH + 1,
                            availableIds,
                            missingIds,
                            allPresent: missingIds.length === 0,
                        });
                    }
                }
            }
        }

        // Filter out very short slots (< 1 hr already guaranteed) and sort: full-attendance first
        return slots.sort((a, b) => {
            if (a.allPresent && !b.allPresent) return -1;
            if (!a.allPresent && b.allPresent) return 1;
            return 0;
        });
    }, [selectedIds]);

    const noOverlap =
        selectedIds.length > 0 && freeSlots.filter((s) => s.allPresent).length === 0;

    // ── Project meetings ──────────────────────────────────────────────────────
    const projectMeetings = meetings
        .filter((m) => m.projectId === projectId)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // ── Prefill & open form from a slot ──────────────────────────────────────
    const openFormFromSlot = (slot: FreeSlot) => {
        setPrefillSlot(slot);
        setForm((f) => ({
            ...f,
            date: nextDateForDay(slot.dayOfWeek),
            startHour: slot.startHour,
            endHour: Math.min(slot.startHour + 1, slot.endHour),
        }));
        setShowForm(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !currentUser) return;

        const [yr, mo, dy] = form.date.split('-').map(Number);
        const start = new Date(yr, mo - 1, dy, form.startHour, 0);
        const end = new Date(yr, mo - 1, dy, form.endHour, 0);

        const newMeeting: Meeting = {
            id: Date.now(),
            projectId,
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            startTime: start,
            endTime: end,
            attendees: prefillSlot ? prefillSlot.availableIds : selectedIds,
            createdBy: currentUser.id,
            location: form.location.trim() || undefined,
            status: 'scheduled',
        };

        addMeeting(newMeeting);
        setSuccess(true);
        setShowForm(false);
        setPrefillSlot(null);
        setForm({ title: '', description: '', location: '', date: nextDateForDay(1), startHour: 10, endHour: 11 });
        setTimeout(() => setSuccess(false), 3000);
    };

    const getUserName = (id: number) =>
        users.find((u) => u.id === id)?.name ?? `User ${id}`;

    return (
        <div className="space-y-6">

            {/* ── Success Banner ─────────────────────────────────────────── */}
            {success && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Meeting scheduled successfully!</span>
                </div>
            )}

            {/* ── Scheduled Meetings (primary) ───────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-800">Scheduled Meetings</h3>
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                        {projectMeetings.length}
                    </span>
                </div>

                {projectMeetings.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No meetings scheduled yet.</p>
                ) : (
                    <div className="space-y-3">
                        {projectMeetings.map((m) => {
                            const start = new Date(m.startTime);
                            const end = new Date(m.endTime);
                            const isPast = end < new Date();
                            return (
                                <div
                                    key={m.id}
                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                        isPast ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-purple-100 bg-purple-50 hover:shadow-sm'
                                    }`}
                                >
                                    {/* Date pill */}
                                    <div className="flex-shrink-0 w-12 text-center bg-white rounded-xl border border-slate-200 py-1.5 px-1">
                                        <p className="text-xs text-slate-500 font-medium leading-none">
                                            {start.toLocaleDateString('en-US', { month: 'short' })}
                                        </p>
                                        <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">{start.getDate()}</p>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{m.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            {' – '}
                                            {end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            {m.location && (
                                                <>
                                                    <span className="mx-1 text-slate-300">·</span>
                                                    <MapPin className="w-3 h-3" />
                                                    {m.location}
                                                </>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2">
                                            {m.attendees.map((uid) => (
                                                <Avatar key={uid} name={getUserName(uid)} size="sm" />
                                            ))}
                                        </div>
                                    </div>

                                    <span
                                        className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                                            isPast
                                                ? 'bg-slate-200 text-slate-500'
                                                : m.status === 'scheduled'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-600'
                                        }`}
                                    >
                                        {isPast ? 'Past' : m.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Divider with label ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Find a time &amp; schedule</span>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* ── Member Selector ────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <h3 className="text-sm font-bold text-slate-800">Select Members</h3>
                    </div>
                    <button
                        onClick={toggleAll}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-lg transition-all"
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-3">
                    {members.map((m) => {
                        const active = selectedIds.includes(m.id);
                        return (
                            <button
                                key={m.id}
                                onClick={() => toggleMember(m.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-sm font-medium ${
                                    active
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                <Avatar name={m.name} size="sm" />
                                {m.name.split(' ')[0]}
                                {active && <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />}
                            </button>
                        );
                    })}
                </div>

                {selectedIds.length < 2 && (
                    <p className="text-xs text-slate-400 mt-3 italic">Select at least 2 members to find overlapping free slots.</p>
                )}
            </div>

            {/* ── No Overlap Warning ─────────────────────────────────────── */}
            {selectedIds.length >= 2 && noOverlap && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-800">No common free slot found</p>
                        <p className="text-sm text-amber-700 mt-1">
                            The selected members have no overlapping availability this week.
                            Ask them to free up some time, or try a smaller group.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Free Slots ─────────────────────────────────────────────── */}
            {selectedIds.length >= 2 && freeSlots.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <h3 className="text-sm font-bold text-slate-800">Available Time Slots</h3>
                        </div>
                        <span className="text-xs text-slate-400">
                            {selectedIds.length === 1 ? '1 member' : `${selectedIds.length} members`} selected
                        </span>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                            All {selectedIds.length > 1 ? 'selected members' : 'free'}
                        </span>
                        {selectedIds.length > 1 && (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                                Partial overlap
                            </span>
                        )}
                    </div>

                    {/* Group by day */}
                    {[1, 2, 3, 4, 5].map((dow) => {
                        const daySlots = freeSlots.filter((s) => s.dayOfWeek === dow);
                        if (daySlots.length === 0) return null;
                        return (
                            <div key={dow} className="mb-5">
                                <p className="text-sm font-semibold text-slate-600 mb-2">{DAY_NAMES[dow]}</p>
                                <div className="space-y-2">
                                    {daySlots.map((slot, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                                slot.allPresent
                                                    ? 'border-emerald-200 bg-emerald-50'
                                                    : 'border-yellow-200 bg-yellow-50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span
                                                    className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                                        slot.allPresent ? 'bg-emerald-400' : 'bg-yellow-400'
                                                    }`}
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {fmt12(slot.startHour)} – {fmt12(slot.endHour)}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {slot.availableIds.map((uid) => (
                                                            <span
                                                                key={uid}
                                                                className="text-xs px-2 py-0.5 bg-white rounded-full border border-emerald-200 text-emerald-700 font-medium"
                                                            >
                                                                {getUserName(uid).split(' ')[0]}
                                                            </span>
                                                        ))}
                                                        {slot.missingIds.map((uid) => (
                                                            <span
                                                                key={uid}
                                                                className="text-xs px-2 py-0.5 bg-white rounded-full border border-red-200 text-red-500 font-medium line-through"
                                                            >
                                                                {getUserName(uid).split(' ')[0]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openFormFromSlot(slot)}
                                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex-shrink-0 ml-4"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Schedule
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Schedule Form Modal ────────────────────────────────────── */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => { setShowForm(false); setPrefillSlot(null); }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-500 to-indigo-600">
                            <h3 className="text-white font-bold text-base">Schedule Meeting</h3>
                            <button
                                onClick={() => { setShowForm(false); setPrefillSlot(null); }}
                                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {prefillSlot && (
                                <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>
                                        Pre-filled from <strong>{DAY_NAMES[prefillSlot.dayOfWeek]}</strong>{' '}
                                        {fmt12(prefillSlot.startHour)}–{fmt12(prefillSlot.endHour)} slot.
                                        Attendees: {prefillSlot.availableIds.map((id) => getUserName(id).split(' ')[0]).join(', ')}
                                    </span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Sprint Planning, Design Review..."
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="What's this meeting about?"
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Start</label>
                                        <select
                                            value={form.startHour}
                                            onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                                                <option key={h} value={h}>{fmt12(h)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">End</label>
                                        <select
                                            value={form.endHour}
                                            onChange={(e) => setForm({ ...form, endHour: Number(e.target.value) })}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => i)
                                                .filter((h) => h > form.startHour)
                                                .map((h) => (
                                                    <option key={h} value={h}>{fmt12(h)}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Location (optional)</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        placeholder="e.g. Zoom, Library Room 3A"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setPrefillSlot(null); }}
                                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={!form.title.trim()}
                                    >
                                        Confirm Meeting
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual schedule button when form is closed */}
            {!showForm && selectedIds.length >= 2 && (
                <button
                    onClick={() => { setPrefillSlot(null); setShowForm(true); }}
                    className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Schedule manually (pick any time)
                </button>
            )}

        </div>
    );
};

export default MeetingScheduler;
