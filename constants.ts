import { StageKey, ColumnData } from './types';

export const STAGES_CONFIG: { 
  id: StageKey; 
  name: string; 
  accentColor: string; // Tailwind class for buttons, etc.
  dotColor: string; // Tailwind class for the dot
  textColor: string; // Tailwind class for title text (might not be used directly if title style is consistent)
}[] = [
  { id: StageKey.TODO, name: "A Fazer", accentColor: "bg-indigo-500 hover:bg-indigo-600", dotColor: "bg-indigo-500", textColor: "text-gray-800" },
  { id: StageKey.IN_PROGRESS, name: "Em Andamento", accentColor: "bg-orange-500 hover:bg-orange-600", dotColor: "bg-orange-500", textColor: "text-gray-800" },
  { id: StageKey.COMPLETED, name: "Concluídas", accentColor: "bg-emerald-500 hover:bg-emerald-600", dotColor: "bg-emerald-500", textColor: "text-gray-800" },
];

export const INITIAL_COLUMNS: ColumnData[] = STAGES_CONFIG.map(stage => ({
  id: stage.id,
  name: stage.name,
  tasks: [],
  accentColor: stage.accentColor,
  dotColor: stage.dotColor,
}));

// Updated priority display names to Portuguese.
export const PRIORITY_STYLES: { [key: string]: { pill: string, text: string, display: string } } = {
  "Important":    { pill: "bg-indigo-100", text: "text-indigo-600", display: "Importante" },
  "High Priority":{ pill: "bg-red-100", text: "text-red-600", display: "Alta Prioridade" }, 
  "Medium":       { pill: "bg-yellow-100", text: "text-yellow-700", display: "Média" },
  "Low":          { pill: "bg-blue-100", text: "text-blue-600", display: "Baixa Prioridade" },
  "Meh":          { pill: "bg-gray-100", text: "text-gray-600", display: "Sem Urgência" },
  "OK":           { pill: "bg-green-100", text: "text-green-600", display: "Normal" },
  "Default":      { pill: "bg-slate-100", text: "text-slate-600", display: "Padrão" }
};

export const PRIORITY_ORDER: { [key: string]: number } = {
  "High Priority": 1,
  "Important": 2,
  "Medium": 3,
  "Normal": 4, // "OK" has the same display "Normal" and can share the order
  "OK": 4,
  "Low": 5,
  "Meh": 6,
  "Default": 7,
};

export type SortType = 
  | 'alphabetical-asc' 
  | 'alphabetical-desc' 
  | 'priority' 
  | 'comments' 
  | 'recent'
  | null;

export const SORT_OPTIONS: { key: SortType; label: string }[] = [
  { key: 'alphabetical-asc', label: 'Ordem Alfabética (A-Z)' },
  { key: 'alphabetical-desc', label: 'Ordem Alfabética (Z-A)' },
  { key: 'priority', label: 'Por Prioridade (Alta > Baixa)' },
  { key: 'comments', label: 'Por Comentários (Mais > Menos)' },
  { key: 'recent', label: 'Mais Recentes Primeiro' },
];