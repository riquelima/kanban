
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  task_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Assignee {
  id: string; // User ID or unique identifier for the assignee
  avatarUrl?: string; // URL to avatar image
  initials?: string; // Initials to display if no avatar
  name?: string; // Full name for tooltips, etc.
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  checklist: ChecklistItem[];
  stageId: StageKey; // Changed from dayId
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  priority?: string; // e.g., "Important", "Meh", "High Priority", "OK"
  assignees?: Assignee[];
  commentsCount?: number;
}

export enum StageKey {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ColumnData {
  id: StageKey;
  name: string;
  tasks: Task[];
  accentColor?: string; // For UI elements like buttons/dots
  dotColor?: string; // Specific color for the dot in header
}

export interface User {
  id: string;
  username: string;
}

export interface ReleaseUpdate {
  id: string;
  version_tag: string;
  title: string;
  content_html: string;
  created_at: string;
}

export interface UserUpdateView {
  id?: string;
  user_id: string;
  release_update_id: string;
  login_count_for_update: number;
  last_seen_at?: string;
}
