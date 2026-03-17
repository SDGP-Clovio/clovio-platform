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
  description: string;
  fairness: number;
  status: "On Track" | "At Risk" | "Completed" | "Overdue";
  tag: string;
}

export interface ProjectDistribution {

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

export interface User {
  name: string;
}

export interface Task {
  id: string;
  title: string;
  assignee?: string;
  status: "todo" | "in_progress" | "done";
  skill_gap?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  effort: number;  // effort points
  suggestedTimeline: string;
  tasks: Task[];
}