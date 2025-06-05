
import React from 'react';
import { TaskCardType, DayOfWeekId } from '../types';
import TrashIcon from './icons/TrashIcon';
import CheckIcon from './icons/CheckIcon';

interface TaskCardProps {
  task: TaskCardType;
  dayId: DayOfWeekId;
  onOpenChecklist: (dayId: DayOfWeekId, task: TaskCardType) => void;
  onDeleteTask: (dayId: DayOfWeekId, taskId: string) => void;
  // isDragging?: boolean; // Optional: if you want to change style while dragging
}

const TaskCard: React.FC<TaskCardProps> = ({ task, dayId, onOpenChecklist, onDeleteTask /*, isDragging */ }) => {
  const isCompleted = task.checklist.length > 0 && task.checklist.every(item => item.completed);
  
  const cardBaseStyles = "p-3 my-2 rounded-lg shadow-md border cursor-pointer transition-all duration-150 ease-in-out";
  const pendingCardColors = "bg-yellow-400 hover:bg-yellow-500 border-yellow-500 text-yellow-900";
  const completedCardColors = "bg-green-600 hover:bg-green-700 border-green-700 text-green-100";
  
  // let cardDynamicStyles = isDragging ? "opacity-75 shadow-2xl scale-105" : ""; // Example dragging style
  
  const cardStyles = `${cardBaseStyles} ${isCompleted ? completedCardColors : pendingCardColors}`;
  const taskNameColor = isCompleted ? "text-green-50" : "text-yellow-950"; // Darker yellow text for better contrast
  const checklistStatusColor = isCompleted ? "text-green-200" : "text-yellow-800";
  const noChecklistTextColor = "text-yellow-700 opacity-80";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onDeleteTask(dayId, task.id);
  };
  
  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;

  return (
    <div
      className={cardStyles}
      onClick={() => onOpenChecklist(dayId, task)}
      aria-label={`Task: ${task.name}, status: ${isCompleted ? 'completed' : 'pending'}`}
    >
      <div className="flex justify-between items-start">
        <h4 className={`font-semibold text-md break-words ${taskNameColor}`}>{task.name}</h4>
        <button
          onClick={handleDelete}
          className="text-red-300 hover:text-red-200 p-1 rounded-full hover:bg-red-700 hover:bg-opacity-50 transition-colors opacity-75 hover:opacity-100"
          aria-label="Delete task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      {(totalItems > 0 || isCompleted) && (
         <div className={`mt-2 flex items-center text-xs ${checklistStatusColor}`}>
          {isCompleted ? (
            <CheckIcon className="w-4 h-4 text-green-300 mr-1" />
          ) : (
            <div className={`w-3 h-3 border ${isCompleted ? 'border-green-400' : 'border-yellow-700'} rounded-full mr-1.5`}></div>
          )}
          <span>
            {completedItems}/{totalItems} concluído{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      )}
       {task.checklist.length === 0 && !isCompleted && (
         <p className={`text-xs mt-1 ${noChecklistTextColor}`}>Sem checklist. Clique para adicionar.</p>
       )}
    </div>
  );
};

export default TaskCard;