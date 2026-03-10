import type { User } from "../types/index";
import { useState } from "react";

interface TopBarProps {
  user: User;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function TopBar({ user,searchQuery,setSearchQuery }: TopBarProps) {
  const [focused, setFocused] = useState(false);
  
  return (
    <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
      {/* Header */}
      <div>
        <div className="text-[11px] text-[#555] uppercase tracking-widest mb-1">Dashboard</div>
        <h1 className="m-0 text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">
          Hey, {user.name}!
        </h1>

        <p className="m-0 text-gray-400 text-sm mt-0.5">{user.name}</p> {/*Quote of the day */}
      </div>
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className={`pb-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5  flex items-center gap-2 text-sm transition-all duration-300 
        ${focused ? "w-72" : "w-44"}`}
        >
          <span className="text-sm text-[#666]">⌕</span>
          <input
            type="text"
            placeholder="Search projects…"
            className="bg-transparent outline-none text-sm text-[#444] w-full"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
  />
        </div>
        <button
          className="pr-6 pb-3 border-none rounded-[10px] px-4 py-2.5 font-bold text-sm cursor-pointer text-white"
          style={{ background: "linear-gradient(135deg,#B179DF,#85D5C8)" }}
        >
          + New Project
        </button>

      </div>
    </header>
  );
}
