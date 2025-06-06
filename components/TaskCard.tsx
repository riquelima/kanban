
import React, { useCallback } from 'react';
import { Task, ChecklistItem, Assignee, StageKey } from '../types';
import IconButton from './IconButton';
import { PRIORITY_STYLES } from '../constants';

interface TaskCardProps {
  task: Task;
  isCompact?: boolean; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, stageId: StageKey) => void;
  onUpdateTask: (updatedTask: Task) => void; 
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceStageId: StageKey) => void;
}

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

// AssigneeAvatar and ChatBubbleOvalLeftEllipsisIcon are removed as they are no longer used in this file.

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  isCompact = false, 
  onEdit, 
  onDelete, 
  onDragStart,
}) => {
  
  const priorityInfo = (task.priority && PRIORITY_STYLES[task.priority]) ? PRIORITY_STYLES[task.priority] : PRIORITY_STYLES["Default"];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id, task.stageId)}
      className={`bg-white dark:bg-[#2A2A2E] dark:border dark:border-[#3C3C43] rounded-xl shadow-md dark:shadow-md dark:shadow-black/10 hover:shadow-lg dark:hover:shadow-black/20 mb-3 cursor-grab active:cursor-grabbing transition-all duration-150 group ${isCompact ? 'px-3 py-2.5' : 'px-4 py-3'}`}
      aria-label={`Tarefa: ${task.title}`}
      onClick={() => onEdit(task)} 
    >
      <div className="flex justify-between items-start mb-2">
         {task.priority && (
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${priorityInfo.pill} ${priorityInfo.text}`}>
              {priorityInfo.display.replace(/ /g, '\u00A0')}
            </span>
          )}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"> {/* Added ml-auto to push icons to the right if priority is not present */}
           <IconButton onClick={(e) => { e.stopPropagation(); onEdit(task);}} ariaLabel={`Editar tarefa ${task.title}`} className="p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]">
            <EditIcon className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-500 dark:text-[#9CA3AF] dark:opacity-90 dark:hover:text-white dark:hover:opacity-100" />
          </IconButton>
          <IconButton onClick={(e) => { e.stopPropagation(); onDelete(task.id, task.stageId);}} ariaLabel={`Excluir tarefa ${task.title}`} className="p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]">
            <TrashIcon className="w-3.5 h-3.5 text-slate-500 hover:text-red-500 dark:text-[#9CA3AF] dark:opacity-90 dark:hover:text-red-400 dark:hover:opacity-100" />
          </IconButton>
        </div>
      </div>

      <h3 className={`font-medium text-gray-800 dark:text-[#E5E7EB] break-words pr-1 ${isCompact ? 'text-xs' : 'text-sm'} ${!isCompact && task.description ? 'mb-1' : (isCompact ? 'mb-0' : 'mb-0') }`}> {/* Adjusted margins */}
        {task.title}
      </h3>
      
      {!isCompact && task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 break-words pr-1">
          {task.description}
        </p>
      )}
      
      {/* Assignees and comments sections have been removed */}
      {/* The card content (title, priority, etc.) will remain. If checklist items were to be shown directly on card, they would go here. */}

    </div>
  );
};

export default TaskCard;
