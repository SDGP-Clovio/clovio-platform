import { useState } from "react";
import Sidebar from "../components/common/NavBar";
import TopBar from "../components/MainDashboard/TopBarDashboard";
import ProjectList from "../components/MainDashboard/ProjectList";
import MiniCalendar from "../components/MainDashboard/MiniCalendar";
import UpcomingMeetings from "../components/MainDashboard/UpcomingMeetings";
import { USER,PROJECTS, MEETINGS } from "../types/mockData";

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState("All")

  const filteredProjects = PROJECTS
  .filter((project) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Active") return project.status === "On Track";
    if (statusFilter === "At Risk") return project.status === "At Risk";
    if (statusFilter === "Overdue") return project.status === "Overdue";
    return true;
  })
  .filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
<div className="flex h-screen bg-gray-100">      {/* Left collapsible sidebar */}
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((prev) => !prev)}
        activeIndex={activeNav}
        onNavClick={setActiveNav}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          user={USER}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Filters + project list */}
<main className="flex-1 p-5 flex flex-col gap-2 overflow-y-auto">            <div className="flex items-center justify-between mb-3.5">
              <span className="ml-3 text-s text-[#555] uppercase tracking-widest">All Projects</span>
              <div className="flex gap-1.5">
                {["All", "Active", "At Risk", "Overdue"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className="px-3 py-1 rounded-full text-[13px] cursor-pointer"
                    style={{
                      background: statusFilter === f ? "rgba(177,121,223,0.15)" : "transparent",
                      color:      statusFilter === f ? "#B179DF" : "#555",
                      border:     statusFilter === f
                        ? "1px solid rgba(177,121,223,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <ProjectList projects={filteredProjects} />
          </main>
          

          {/* Right sidebar */}
          <aside className="w-72 bg-white border-l border-gray-100 overflow-y-auto p-5 flex flex-col gap-6 flex-shrink-0">
            <MiniCalendar meetings={MEETINGS} />
            <div className="h-px bg-gray-100" />
            <UpcomingMeetings meetings={MEETINGS} />
            <div className="h-px bg-gray-100" />
          </aside>
        </div>
      </div>
    </div>
  );
}
