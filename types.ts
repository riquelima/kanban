
export type DayOfWeekId = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ChecklistItemType {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskCardType {
  id: string;
  name: string;
  checklist: ChecklistItemType[];
}

export interface DayColumnType {
  id: DayOfWeekId;
  title: string;
  tasks: TaskCardType[];
}

export interface EditingTaskDetails {
  dayId: DayOfWeekId;
  task: TaskCardType;
}
