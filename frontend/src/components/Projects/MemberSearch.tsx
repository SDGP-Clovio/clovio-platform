import React, { useState, useRef, useEffect } from 'react';
import { Search, X, UserPlus } from 'lucide-react';
import Avatar from '../UI/Avatar';
import type { User } from '../../types/types';

interface Props {
    /** All users available to add */
    allUsers: User[];
    /** Currently selected user IDs */
    selectedIds: string[];
    /** Fires when a user is added or removed */
    onChange: (ids: string[]) => void;
}

const MemberSearch: React.FC<Props> = ({ allUsers, selectedIds, onChange }) => {
    const [query,    setQuery]    = useState('');
    const [open,     setOpen]     = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    /* Close dropdown on outside click */
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const add    = (uid: string) => { onChange([...selectedIds, uid]); setQuery(''); };
    const remove = (uid: string) => onChange(selectedIds.filter((id) => id !== uid));

    const selectedUsers = allUsers.filter((u) => selectedIds.includes(u.id));
    const results = allUsers.filter(
        (u) =>
            !selectedIds.includes(u.id) &&
            (u.email.toLowerCase().includes(query.toLowerCase()) ||
             u.name.toLowerCase().includes(query.toLowerCase())),
    );
    const showDropdown = open && query.trim().length > 0 && results.length > 0;

    return (
        <div className="space-y-3">
            {/* Search input */}
            <div ref={containerRef} className="relative">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        placeholder="Search by name or email…"
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        {results.slice(0, 6).map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => { add(u.id); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
                            >
                                <Avatar name={u.name} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                </div>
                                <UserPlus className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                )}

                {/* No results hint */}
                {open && query.trim().length > 0 && results.length === 0 && (
                    <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
                        <p className="text-xs text-slate-400">No users found for "{query}"</p>
                    </div>
                )}
            </div>

            {/* Selected member chips */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((u) => (
                        <div
                            key={u.id}
                            className="flex items-center gap-2 pl-2 pr-1 py-1 bg-purple-50 border border-purple-200 rounded-lg"
                        >
                            <Avatar name={u.name} size="sm" />
                            <div className="leading-tight">
                                <p className="text-xs font-semibold text-purple-800">{u.name}</p>
                                <p className="text-[10px] text-purple-500">{u.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(u.id)}
                                className="ml-1 p-0.5 rounded-md hover:bg-purple-200 text-purple-500 hover:text-purple-700 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedUsers.length === 0 && (
                <p className="text-xs text-slate-400">No members added yet.</p>
            )}
        </div>
    );
};

export default MemberSearch;
