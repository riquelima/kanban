import { createClient } from '@supabase/supabase-js';
import { DayKey } from './types'; // Import DayKey

// ATENÇÃO: É uma melhor prática armazenar estas credenciais em variáveis de ambiente.
// No entanto, seguindo a solicitação, elas estão hardcoded aqui.
const supabaseUrl = 'https://pobqcwcxspweujyssmrs.supabase.co'; // Corrigido da URL do dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYnFjd2N4c3B3ZXVqeXNzbXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzEzNTIsImV4cCI6MjA2NDcwNzM1Mn0.oN9k5gz7rWtoCjLn152inBzMNjwgvY5NJ89I4zSdDnM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipagem para os dados que vêm do Supabase (opcional, mas ajuda)
export interface DbTask {
  id: string; // UUID
  title: string;
  description?: string | null;
  day_id: DayKey; // Armazenará "MONDAY", "TUESDAY", etc.
  created_at: string;
  updated_at: string;
  // user_id?: string | null;
}

export interface DbChecklistItem {
  id: string; // UUID
  task_id: string; // Foreign key para tasks.id
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  // position?: number;
}
