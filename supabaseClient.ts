import { createClient } from '@supabase/supabase-js';
import { DayOfWeekId, TaskCardType as AppTaskCardType, ChecklistItemType as AppChecklistItemType } from './types';

// Provided Supabase URL and Anon Key
const supabaseUrl = 'https://pobqcwcxspweujyssmrs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYnFjd2N4c3B3ZXVqeXNzbXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzEzNTIsImV4cCI6MjA2NDcwNzM1Mn0.oN9k5gz7rWtoCjLn152inBzMNjwgvY5NJ89I4zSdDnM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Please check your environment variables or configuration.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define interfaces for Supabase table rows to ensure type safety
// These might be slightly different from your app types (e.g., column names like day_id)

export interface SupabaseDay {
  id: DayOfWeekId; // 'monday', 'tuesday', etc.
  title: string;
  created_at: string;
}

export interface SupabaseTask {
  id: string; // UUID from Supabase
  day_id: DayOfWeekId;
  name: string;
  created_at: string;
  updated_at: string;
  //checklist?: AppChecklistItemType[]; // This will be populated by joining/fetching separately
}

export interface SupabaseChecklistItem {
  id: string; // UUID from Supabase
  task_id: string; // Foreign key to tasks.id
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
