import type { NavItem } from "../types/index";
import { NAV_ITEMS, NAV_BOTTOM } from "../types/mockData"

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  activeIndex: number;
  onNavClick: (i: number) => void;
}

export default function Sidebar({
  expanded,
  onToggle,
  activeIndex,
  onNavClick,
}: SidebarProps) {
  return (
    <nav
      className={`
        ${expanded ? "w-56" : "w-[68px]"}
        bg-[#1A1A1A] flex flex-col py-5 flex-shrink-0 relative z-10
        shadow-[4px_0_24px_rgba(0,0,0,0.12)]
        transition-all duration-300 ease-in-out overflow-hidden
      `}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 pb-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B179DF] to-[#85D5C8] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 tracking-tight">
          M
        </div>
        {expanded && (
          <span className="text-white font-bold text-lg whitespace-nowrap tracking-tight">
            Clovio
          </span>
        )}
      </div>

      {/* Toggle chevron */}
      <button
        onClick={onToggle}
        className="absolute top-5 right-3 w-6 h-6 bg-white/10 border-none rounded-md text-gray-400 text-sm flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
      >
        {expanded ? "‹" : "›"}
      </button>

      {/* Main nav */}
      <div className="flex-1 flex flex-col gap-0.5 px-2.5">
        {NAV_ITEMS.map((item: NavItem, i: number) => {
          const isActive = activeIndex === i;
          return (
            <button
              key={i}
              onClick={() => onNavClick(i)}
              className={`
                flex items-center gap-3 px-2.5 py-2.5 rounded-xl border-none w-full
                text-sm font-medium whitespace-nowrap cursor-pointer
                transition-all duration-200
                border-l-[3px]
                ${isActive
                  ? "bg-gradient-to-r from-[#B179DF]/20 to-[#85D5C8]/10 text-[#B179DF] border-l-[#B179DF] font-bold"
                  : "text-gray-500 border-l-transparent hover:bg-white/5 hover:text-gray-300"
                }
              `}
            >
              <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>

              {expanded && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#B179DF] text-white rounded-full text-[10px] font-bold px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {!expanded && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B179DF] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div className="px-2.5 flex flex-col gap-0.5">
        <div className="h-px bg-white/10 my-2" />
        {NAV_BOTTOM.map((item: NavItem, i: number) => (
          <button
            key={i}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl border-none bg-transparent text-gray-600 cursor-pointer text-sm whitespace-nowrap w-full hover:bg-white/5 hover:text-gray-400 transition-colors"
          >
            <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
            {expanded && <span>{item.label}</span>}
          </button>
        ))}

        {/* User avatar */}
        <div className="flex items-center gap-2.5 px-2.5 pt-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B179DF] to-[#85D5C8] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            K
          </div>
          {expanded && (
            <div>
              <p className="text-gray-300 text-xs font-semibold m-0">Kavithaki W.</p>
              <p className="text-gray-600 text-[10px] m-0">w2121187</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
