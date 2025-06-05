import { DayKey, ColumnData } from './types';

export const DAYS_OF_WEEK: { id: DayKey; name: string }[] = [
  { id: DayKey.MONDAY, name: "Segunda-feira" },
  { id: DayKey.TUESDAY, name: "Terça-feira" },
  { id: DayKey.WEDNESDAY, name: "Quarta-feira" },
  { id: DayKey.THURSDAY, name: "Quinta-feira" },
  { id: DayKey.FRIDAY, name: "Sexta-feira" },
  { id: DayKey.SATURDAY, name: "Sábado" },
  { id: DayKey.SUNDAY, name: "Domingo" },
];

export const INITIAL_COLUMNS: ColumnData[] = DAYS_OF_WEEK.map(day => ({
  id: day.id,
  name: day.name,
  tasks: []
}));

export const ACCENT_COLOR_CLASS = "bg-purple-600 hover:bg-purple-700"; // Roxo Neon
export const ACCENT_TEXT_COLOR_CLASS = "text-purple-400";
export const CARD_BACKGROUND_CLASS = "bg-yellow-700"; // Amarelo escuro para cards