import type { User, Project, Meeting, Stat, NavItem, ProjectPlan } from "./index";

export const PROJECTS: Project[] = [
  {
    id: 1,
    name: "Clovio – AI Collaboration Tool",
    module: "5COSC021C",
    progress: 68,
    description: "An AI-powered platform to fix the free-rider problem in academic group projects.",
    dueDate: "Apr 10, 2026",
    members: [
      { initial: "P", color: "#4F46E5" },
      { initial: "K", color: "#10B981" },
      { initial: "M", color: "#F59E0B" },
      { initial: "R", color: "#EF4444" },
      { initial: "S", color: "#4F46E5" },
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
    description: "An AI-powered platform to fix the free-rider problem in academic group projects.",
    dueDate: "Mar 28, 2026",
    members: [
      { initial: "A", color: "#F59E0B" },
      { initial: "N", color: "#4F46E5" },
      { initial: "T", color: "#10B981" },
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
    description: "An AI-powered platform to fix the free-rider problem in academic group projects.",
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
    description: "An AI-powered platform to fix the asm sisd  dopnt undersatan howd this ccodsflsf nget andkas taskewndai rider problem in academic group projects.",

    dueDate: "May 1, 2026",
    members: [
      { initial: "D", color: "#4F46E5" },
      { initial: "C", color: "#F59E0B" },
      { initial: "V", color: "#10B981" },
      { initial: "B", color: "#4F46E5" },
    ],
    fairness: 73,
    status: "On Track",
    tag: "Security / Node",
  },
];

export const MEETINGS: Meeting[] = [
  { month: 2, day: 2, label: "Sprint Review", time: "10:00 AM", color: "#4F46E5" },
  { month: 3, day: 4, label: "Stand-up", time: "9:00 AM", color: "#10B981" },
  { month: 3, day: 7, label: "Design Review", time: "2:00 PM", color: "#4F46E5" },
  { month: 3, day: 9, label: "Stand-up", time: "9:00 AM", color: "#10B981" },
  { month: 4, day: 12, label: "Sprint Planning", time: "11:00 AM", color: "#4F46E5" },
  { month: 5, day: 14, label: "Team Sync", time: "3:00 PM", color: "#F59E0B" },
  { month: 7, day: 16, label: "Stand-up", time: "9:00 AM", color: "#10B981" },
  { month: 2, day: 19, label: "Demo Day", time: "1:00 PM", color: "#EF4444" },
  { month: 5, day: 21, label: "Retrospective", time: "4:00 PM", color: "#4F46E5" },
  { month: 4, day: 23, label: "Stand-up", time: "9:00 AM", color: "#10B981" },
  { month: 7, day: 26, label: "Sprint Review", time: "10:00 AM", color: "#4F46E5" },
];

export const STATS: Stat[] = [
  {
    label: "Active Projects",
    value: 4,
    icon: "◈",
    colorClass: "text-[#4F46E5]",
    bgClass: "bg-[#EEF2FF]",
  },
  {
    label: "Tasks Due This Week",
    value: 7,
    icon: "◎",
    colorClass: "text-[#10B981]",
    bgClass: "bg-[#ECFDF5]",
  },
  {
    label: "Avg Fairness Score",
    value: "79%",
    icon: "◑",
    colorClass: "text-[#4F46E5]",
    bgClass: "bg-[#EEF2FF]",
  },
  {
    label: "Meetings This Month",
    value: 11,
    icon: "◷",
    colorClass: "text-[#10B981]",
    bgClass: "bg-[#ECFDF5]",
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

export const USER: User =
  { name: "Kavithaki" }

export const MOCK_PLAN: ProjectPlan = {
  project_name: "Clovio – AI Collaboration Tool",
  overall_risk_warning:
    "Kavithaki W. is the sole React expert — bus factor risk. Consider pairing with another member for knowledge sharing.",
  milestones: [
    {
      title: "Phase 1: Research & Planning",
      order: 1,
      phaseStatus: "completed",
      progress: 100,
      tasks: [
        { id: 1, name: "Define project scope", description: "Scope, goals, success criteria", complexity: 3, required_skills: ["Planning", "Communication"], assigned_to: "Kavithaki W.", assignment_reason: "Lead with highest planning XP", is_skill_gap: false, hours: 3, priority: "high", status: "done" },
        { id: 2, name: "User research interviews", description: "Interview 10 target users", complexity: 5, required_skills: ["Research", "Writing"], assigned_to: "Ravi K.", assignment_reason: "Strong research background", is_skill_gap: false, hours: 5, priority: "high", status: "done" },
        { id: 3, name: "Competitor analysis", description: "Review 5 competing products", complexity: 4, required_skills: ["Analysis"], assigned_to: "Nina L.", assignment_reason: "Available capacity", is_skill_gap: false, hours: 4, priority: "medium", status: "done" },
        { id: 4, name: "Tech stack decision", description: "Evaluate and decide on stack", complexity: 2, required_skills: ["Architecture", "Node"], assigned_to: "Marcus T.", assignment_reason: "Backend expertise", is_skill_gap: false, hours: 2, priority: "high", status: "done" },
      ],
    },
    {
      title: "Phase 2: UI/UX Design",
      order: 2,
      phaseStatus: "completed",
      progress: 100,
      tasks: [
        { id: 5, name: "Wireframes – Dashboard", description: "Low-fi wireframes for dashboard", complexity: 6, required_skills: ["Figma", "Design"], assigned_to: "Priya S.", assignment_reason: "Primary designer", is_skill_gap: false, hours: 6, priority: "high", status: "done" },
        { id: 6, name: "Design system setup", description: "Tokens, components, guidelines", complexity: 4, required_skills: ["CSS", "Figma"], assigned_to: "Priya S.", assignment_reason: "Owns design system", is_skill_gap: false, hours: 4, priority: "medium", status: "done" },
        { id: 7, name: "Prototype review", description: "Stakeholder feedback session", complexity: 3, required_skills: ["Communication", "React"], assigned_to: "Kavithaki W.", assignment_reason: "Tech lead review", is_skill_gap: false, hours: 3, priority: "medium", status: "done" },
      ],
    },
    {
      title: "Phase 3: Core Development",
      order: 3,
      phaseStatus: "active",
      progress: 65,
      tasks: [
        { id: 8, name: "Auth & user profiles", description: "JWT auth + profile CRUD", complexity: 8, required_skills: ["React", "Node"], assigned_to: "Kavithaki W.", assignment_reason: "Expert in both required skills", is_skill_gap: false, hours: 8, priority: "high", status: "done" },
        { id: 9, name: "Project setup wizard", description: "Multi-step project creation UI", complexity: 10, required_skills: ["Python", "SQL"], assigned_to: "Marcus T.", assignment_reason: "Backend lead", is_skill_gap: false, hours: 10, priority: "high", status: "done" },
        { id: 10, name: "AI task distribution engine", description: "Groq-powered task assignment", complexity: 9, required_skills: ["React", "Node", "AI"], assigned_to: "Kavithaki W.", assignment_reason: "Owns AI integration layer", is_skill_gap: false, hours: 12, priority: "high", status: "in-progress" },
        { id: 11, name: "Database schema design", description: "PostgreSQL schema + migrations", complexity: 6, required_skills: ["SQL", "Python"], assigned_to: "Marcus T.", assignment_reason: "SQL expert", is_skill_gap: false, hours: 6, priority: "high", status: "in-progress" },
        { id: 12, name: "Meeting scheduler UI", description: "Availability grid component", complexity: 5, required_skills: ["Figma", "CSS", "React"], assigned_to: "Priya S.", assignment_reason: "UI specialist", is_skill_gap: false, hours: 5, priority: "medium", status: "in-progress" },
        { id: 13, name: "Document hub backend", description: "Upload/versioning endpoints", complexity: 7, required_skills: ["Python", "SQL"], assigned_to: "Marcus T.", assignment_reason: "Backend owns storage layer", is_skill_gap: false, hours: 8, priority: "medium", status: "todo" },
        { id: 14, name: "Real-time chat integration", description: "WebSocket chat system", complexity: 8, required_skills: ["Node", "WebSocket"], assigned_to: "Ravi K.", assignment_reason: "Distributed task", is_skill_gap: true, hours: 7, priority: "low", status: "todo" },
      ],
    },
    {
      title: "Phase 4: Analytics & Testing",
      order: 4,
      phaseStatus: "upcoming",
      progress: 0,
      tasks: [
        { id: 15, name: "Progress dashboard metrics", description: "Chart components + live data", complexity: 6, required_skills: ["React", "Analysis"], assigned_to: "Kavithaki W.", assignment_reason: "React lead", is_skill_gap: false, hours: 6, priority: "high", status: "todo" },
        { id: 16, name: "Bus factor algorithm", description: "Skill-coverage risk calculation", complexity: 5, required_skills: ["Python", "Analysis"], assigned_to: "Marcus T.", assignment_reason: "Algorithm implementation", is_skill_gap: false, hours: 5, priority: "medium", status: "todo" },
        { id: 17, name: "Unit test suite", description: "Jest + Pytest coverage", complexity: 8, required_skills: ["QA", "Python"], assigned_to: "Nina L.", assignment_reason: "QA specialist", is_skill_gap: false, hours: 8, priority: "high", status: "todo" },
        { id: 18, name: "E2E testing", description: "Playwright end-to-end flows", complexity: 6, required_skills: ["QA"], assigned_to: "Nina L.", assignment_reason: "Owns testing", is_skill_gap: false, hours: 6, priority: "medium", status: "todo" },
        { id: 19, name: "Performance audit", description: "Lighthouse + load benchmarks", complexity: 4, required_skills: ["Analysis", "Writing"], assigned_to: "Ravi K.", assignment_reason: "Analysis skills", is_skill_gap: false, hours: 4, priority: "medium", status: "todo" },
      ],
    },
    {
      title: "Phase 5: Deployment & Presentation",
      order: 5,
      phaseStatus: "upcoming",
      progress: 0,
      tasks: [
        { id: 20, name: "Production deployment", description: "Docker + CI/CD pipeline", complexity: 7, required_skills: ["Node", "Python"], assigned_to: "Kavithaki W.", assignment_reason: "DevOps lead", is_skill_gap: false, hours: 4, priority: "high", status: "todo" },
        { id: 21, name: "Final documentation", description: "README, API docs, user guide", complexity: 3, required_skills: ["Writing", "Analysis"], assigned_to: "Ravi K.", assignment_reason: "Strong writing skills", is_skill_gap: false, hours: 5, priority: "medium", status: "todo" },
        { id: 22, name: "Presentation prep", description: "Slide deck + rehearsal session", complexity: 3, required_skills: ["Communication", "Figma"], assigned_to: "Priya S.", assignment_reason: "Design + presentation skills", is_skill_gap: false, hours: 3, priority: "high", status: "todo" },
      ],
    },
  ],
};