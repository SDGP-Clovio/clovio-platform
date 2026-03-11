import type { User, Project, Meeting, Stat, NavItem } from "./index";

export const PROJECTS: Project[] = [
  {
    id: 1,
    name: "Clovio – AI Collaboration Tool",
    module: "5COSC021C",
    progress: 68,
    description:"An AI-powered platform to fix the free-rider problem in academic group projects.",
    dueDate: "Apr 10, 2026",
    members: [
      { initial: "P", color: "#B179DF" },
      { initial: "K", color: "#85D5C8" },
      { initial: "M", color: "#F59E0B" },
      { initial: "R", color: "#EF4444" },
      { initial: "S", color: "#8B5CF6" },
      { initial: "F", color: "#10B981" },
    ],
    fairness: 87,
    status: "On Track",
    tag: "AI / Web App",
  },
  {
    id: 2,
    name: "Smart Campus Nav System",
    module: "4COSC018W",
    progress: 41,
    description:"An AI-powered platform to fix the free-rider problem in academic group projects.",
    dueDate: "Mar 28, 2026",
    members: [
      { initial: "A", color: "#F59E0B" },
      { initial: "N", color: "#B179DF" },
      { initial: "T", color: "#85D5C8" },
    ],
    fairness: 61,
    status: "At Risk",
    tag: "Mobile / IoT",
  },
  {
    id: 3,
    name: "E-Learning Analytics Dashboard",
    module: "6COSC024C",
    progress: 91,
    description:"An AI-powered platform to fix the free-rider problem in academic group projects.",
    dueDate: "Mar 5, 2026",
    members: [
      { initial: "J", color: "#EF4444" },
      { initial: "L", color: "#10B981" },
    ],
    fairness: 95,
    status: "Completed",
    tag: "Data / React",
  },
  {
    id: 4,
    name: "SecureVault – Password Manager",
    module: "5COSC020C",
    progress: 22,
    description:"An AI-powered platform to fix the asm sisd  dopnt undersatan howd this ccodsflsf nget andkas taskewndai rider problem in academic group projects.",

    dueDate: "May 1, 2026",
    members: [
      { initial: "D", color: "#6366F1" },
      { initial: "C", color: "#F59E0B" },
      { initial: "V", color: "#85D5C8" },
      { initial: "B", color: "#B179DF" },
    ],
    fairness: 73,
    status: "On Track",
    tag: "Security / Node",
  },
];

export const MEETINGS: Meeting[] = [
  { month:2, day: 2,  label: "Sprint Review",   time: "10:00 AM", color: "#B179DF" },
  { month:3, day: 4,  label: "Stand-up",        time: "9:00 AM",  color: "#85D5C8" },
  { month:3, day: 7,  label: "Design Review",   time: "2:00 PM",  color: "#B179DF" },
  { month:3, day: 9,  label: "Stand-up",        time: "9:00 AM",  color: "#85D5C8" },
  { month:4, day: 12, label: "Sprint Planning", time: "11:00 AM", color: "#B179DF" },
  { month:5, day: 14, label: "Team Sync",       time: "3:00 PM",  color: "#F59E0B" },
  { month:7, day: 16, label: "Stand-up",        time: "9:00 AM",  color: "#85D5C8" },
  { month:2, day: 19, label: "Demo Day",        time: "1:00 PM",  color: "#EF4444" },
  { month:5, day: 21, label: "Retrospective",   time: "4:00 PM",  color: "#B179DF" },
  { month:4, day: 23, label: "Stand-up",        time: "9:00 AM",  color: "#85D5C8" },
  { month:7, day: 26, label: "Sprint Review",   time: "10:00 AM", color: "#B179DF" },
];

export const STATS: Stat[] = [
  {
    label: "Active Projects",
    value: 4,
    icon: "◈",
    colorClass: "text-[#B179DF]",
    bgClass: "bg-[#E8D5F5]",
  },
  {
    label: "Tasks Due This Week",
    value: 7,
    icon: "◎",
    colorClass: "text-[#85D5C8]",
    bgClass: "bg-[#D4F0EC]",
  },
  {
    label: "Avg Fairness Score",
    value: "79%",
    icon: "◑",
    colorClass: "text-[#B179DF]",
    bgClass: "bg-[#E8D5F5]",
  },
  {
    label: "Meetings This Month",
    value: 11,
    icon: "◷",
    colorClass: "text-[#85D5C8]",
    bgClass: "bg-[#D4F0EC]",
  },
];

export const NAV_ITEMS: NavItem[] = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "◈", label: "My Projects", badge: 4 },
  { icon: "◎", label: "Tasks" },
  { icon: "◷", label: "Meetings" },
  { icon: "◑", label: "Team" },
  { icon: "◻", label: "Documents" },
  { icon: "◊", label: "Analytics" },
];

export const NAV_BOTTOM: NavItem[] = [
  { icon: "⚙", label: "Settings" },
  { icon: "◌", label: "Profile" },
];

export const USER: User= 
  {name: "Kavithaki"}

