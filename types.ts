export interface ChecklistItem {
  id: string; // UUID gerado pelo cliente ou Supabase
  text: string;
  completed: boolean;
  task_id?: string; // Para associar ao criar/atualizar no Supabase
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string; // UUID gerado pelo cliente ou Supabase
  title: string;
  description?: string;
  checklist: ChecklistItem[];
  dayId: DayKey; // Mapeia para tasks.day_id no Supabase
  created_at?: string;
  updated_at?: string;
  user_id?: string; // Para associar tarefas a usuários no frontend
}

export enum DayKey {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface ColumnData {
  id: DayKey;
  name: string;
  tasks: Task[];
}

export interface User {
  id: string; // UUID do usuário no Supabase
  username: string;
}

// Tipos para a funcionalidade "What's New"
export interface ReleaseUpdate {
  id: string;
  version_tag: string;
  title: string;
  content_html: string; // Conteúdo em HTML para o popup
  created_at: string;
}

export interface UserUpdateView {
  id?: string;
  user_id: string;
  release_update_id: string;
  login_count_for_update: number;
  last_seen_at?: string;
}
