export interface Member {
  initial: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  module: string;
  progress: number;
  dueDate: string;
  members: Member[];
  description:string;
  fairness: number;
  status: "On Track" | "At Risk" | "Completed" | "Overdue";
  tag: string;
}

export interface Meeting {
  month: number;
  day: number;
  label: string;
  time: string;
  color: string;
}

export interface Stat {
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
  bgClass: string;
}

export interface NavItem {
  icon: string;
  label: string;
  badge?: number;
}

export interface User{
  name:string;
}

export interface Task {
  id?: number;                   // local UI helper
  name: string;
  description?: string | null;
  complexity: number;            // 1–10 (from backend ge=1, le=10)
  required_skills: string[];
  assigned_to?: string | null;
  assignment_reason?: string | null;
  is_skill_gap: boolean;
  // UI-only extras (not from backend – derived client-side)
  hours?: number;
  priority?: "high" | "medium" | "low";
  status?: "done" | "in-progress" | "todo";
}

export interface Milestone {
  title: string;
  tasks: Task[];
  order?: number | null;
  // UI-only extras
  progress?: number;
  phaseStatus?: "completed" | "active" | "upcoming";
}

/** Mirrors ProjectPlan Pydantic model */
export interface ProjectPlan {
  project_name: string;
  milestones: Milestone[];
  overall_risk_warning?: string | null;
}
