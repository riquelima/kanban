
import React from 'react';
import { ColumnData, Task, DayKey } from '../types';
import TaskCard from './TaskCard';
import IconButton from './IconButton';
import { ACCENT_TEXT_COLOR_CLASS } from '../constants';

interface ColumnProps {
  column: ColumnData;
  onAddTask: (dayId: DayKey) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string, dayId: DayKey) => void;
  onUpdateTask: (updatedTask: Task) => void; // Para UI local
  onDragStartTask: (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceDayId: DayKey) => void;
  onDragOverColumn: (e: React.DragEvent<HTMLDivElement>, targetDayId: DayKey) => void;
  onDropTaskInColumn: (e: React.DragEvent<HTMLDivElement>, targetDayId: DayKey) => void;
  isDraggingOver: boolean;
  onToggleFocus: (dayId: DayKey) => void;
  isFocused: boolean;
  // Novas props para interações com DB de checklist items
  onToggleChecklistItemDB: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  onUpdateChecklistItemTextDB: (taskId: string, itemId: string, newText: string) => Promise<void>;
  onDeleteChecklistItemDB: (taskId: string, itemId: string) => Promise<void>;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const Column: React.FC<ColumnProps> = ({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onDragStartTask,
  onDragOverColumn,
  onDropTaskInColumn,
  isDraggingOver,
  onToggleFocus,
  isFocused,
  onToggleChecklistItemDB, // Passar adiante
  onUpdateChecklistItemTextDB, // Passar adiante
  onDeleteChecklistItemDB, // Passar adiante
}) => {
  return (
    <div
      className={`flex-shrink-0 ${isFocused ? 'w-full' : 'w-full md:w-80 lg:w-96'} bg-neutral-900 rounded-xl shadow-lg p-1 md:p-2 ${isDraggingOver ? 'drag-over' : ''} transition-all duration-300 ease-in-out`}
      onDragOver={(e) => onDragOverColumn(e, column.id)}
      onDrop={(e) => onDropTaskInColumn(e, column.id)}
    >
      <div className="flex justify-between items-center mb-4 p-3 sticky top-0 bg-neutral-900 z-10 rounded-t-xl">
        <h2 
          className={`font-semibold text-lg ${ACCENT_TEXT_COLOR_CLASS} ${!isFocused ? 'cursor-pointer hover:underline' : ''}`}
          onClick={() => onToggleFocus(column.id)}
          title={isFocused ? `Mostrar todos os dias` : `Focar em ${column.name}`}
        >
          {column.name}
        </h2>
        <IconButton onClick={() => onAddTask(column.id)} ariaLabel={`Adicionar tarefa em ${column.name}`}>
          <PlusIcon className={`w-6 h-6 ${ACCENT_TEXT_COLOR_CLASS} hover:text-purple-300`} />
        </IconButton>
      </div>
      <div className={`px-2 pb-2 ${isFocused ? 'h-[calc(100vh-170px)]' : 'h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]'} overflow-y-auto`}>
        {column.tasks.length === 0 && (
          <div className="text-center text-neutral-500 py-10">
            Nenhuma tarefa aqui.
          </div>
        )}
        {column.tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdateTask={onUpdateTask}
            onDragStart={onDragStartTask}
            // Passando os handlers de DB para TaskCard
            onToggleChecklistItemDB={onToggleChecklistItemDB}
            onUpdateChecklistItemTextDB={onUpdateChecklistItemTextDB}
            onDeleteChecklistItemDB={onDeleteChecklistItemDB}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
