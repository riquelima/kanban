
import React from 'react';
import { ColumnData, Task, StageKey } from '../types';
import TaskCard from './TaskCard';
import IconButton from './IconButton';
import { STAGES_CONFIG } from '../constants'; 

interface ColumnProps {
  column: ColumnData;
  isCompact?: boolean; 
  onAddTask: (stageId: StageKey) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string, stageId: StageKey) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDragStartTask: (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceStageId: StageKey) => void;
  onDragOverColumn: (e: React.DragEvent<HTMLDivElement>, targetStageId: StageKey) => void;
  onDropTaskInColumn: (e: React.DragEvent<HTMLDivElement>, targetStageId: StageKey) => void;
  isDraggingOver: boolean;
  onToggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>; // Added prop
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const Column: React.FC<ColumnProps> = ({
  column,
  isCompact = false, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onDragStartTask,
  onDragOverColumn,
  onDropTaskInColumn,
  isDraggingOver,
  onToggleChecklistItem, // Destructure new prop
}) => {
  const stageConfig = STAGES_CONFIG.find(s => s.id === column.id);
  const accentColor = stageConfig?.accentColor || 'bg-gray-500 hover:bg-gray-600';
  const dotColor = stageConfig?.dotColor || 'bg-gray-400';
  const columnBgColor = 'bg-gray-100 dark:bg-[#202024]'; 
  // Removed columnWidthClass, width is now handled by flex-1, min-w, and max-w

  return (
    <div
      className={`flex flex-col flex-1 min-w-[300px] sm:min-w-[320px] max-w-sm ${columnBgColor} rounded-2xl p-2 ${isDraggingOver ? 'drag-over dark:bg-[#2A2A2E]/50' : ''} transition-colors duration-150 ease-in-out`}
      onDragOver={(e) => onDragOverColumn(e, column.id)}
      onDrop={(e) => onDropTaskInColumn(e, column.id)}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* Column Header - prompt specified bg-transparent for header content, so it will inherit columnBgColor */}
      <div className={`p-3 sticky top-0 z-10 ${columnBgColor} rounded-t-2xl dark:border-b dark:border-[#3C3C43]`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <span className={`w-2.5 h-2.5 ${dotColor} rounded-full mr-2.5`}></span>
            <h2 className="font-semibold text-base text-gray-800 dark:text-[#F5F5F5]">{column.name}</h2>
          </div>
          <span className="text-xs text-gray-600 bg-gray-200 dark:text-[#9CA3AF] dark:bg-[#3C3C43] px-2 py-1 rounded-full font-medium">
            {column.tasks.length} Total
          </span>
        </div>
        <button 
          onClick={() => onAddTask(column.id)} 
          aria-label={`Adicionar nova tarefa em ${column.name}`}
          className={`w-full px-3 py-2.5 ${accentColor} text-white text-sm font-medium rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 dark:filter dark:brightness-110 dark:hover:brightness-125`}
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Nova Tarefa
        </button>
      </div>
      
      <div className="px-2 pb-2 flex-grow overflow-y-auto h-[calc(100vh-260px)]"> 
        {column.tasks.length === 0 && (
          <div className="text-center text-slate-500 dark:text-[#9CA3AF] py-10 text-sm">
            Nenhuma tarefa por enquanto.
          </div>
        )}
        {column.tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isCompact={isCompact} 
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdateTask={onUpdateTask}
            onDragStart={onDragStartTask}
            onToggleChecklistItem={onToggleChecklistItem} // Pass down the prop
          />
        ))}
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Column;
