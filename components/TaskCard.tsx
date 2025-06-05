
import React, { useCallback } from 'react';
import { Task, ChecklistItem } from '../types';
import ChecklistItemDisplay from './ChecklistItemDisplay';
import IconButton from './IconButton';
import { CARD_BACKGROUND_CLASS } from '../constants'; // CARD_BACKGROUND_CLASS is now yellow-700

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, dayId: Task['dayId']) => void;
  onUpdateTask: (updatedTask: Task) => void; // Para atualizar estado local síncrono
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceDayId: Task['dayId']) => void;
  onToggleChecklistItemDB: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  onUpdateChecklistItemTextDB: (taskId: string, itemId: string, newText: string) => Promise<void>;
  onDeleteChecklistItemDB: (taskId: string, itemId: string) => Promise<void>;
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

const sortChecklistItemsInternal = (items: ChecklistItem[]): ChecklistItem[] => {
  return [...items].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Uncompleted (false) items first
    }
    // If completion status is the same, sort by creation time
    // Items without created_at (e.g., new client-side items) go last in their group
    const timeA = a.created_at ? new Date(a.created_at).getTime() : Infinity;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : Infinity;

    if (timeA === Infinity && timeB === Infinity) return 0; // Keep relative order of new items
    return timeA - timeB; // Older persisted items first
  });
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onUpdateTask, 
  onDragStart,
  onToggleChecklistItemDB,
  onUpdateChecklistItemTextDB,
  onDeleteChecklistItemDB,
}) => {
  
  const handleToggleChecklistItem = useCallback(async (itemId: string) => {
    const itemToToggle = task.checklist.find(item => item.id === itemId);
    if (!itemToToggle) return;

    const newCompletedState = !itemToToggle.completed;
    
    let updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: newCompletedState } : item
    );
    updatedChecklist = sortChecklistItemsInternal(updatedChecklist);

    try {
      await onToggleChecklistItemDB(task.id, itemId, newCompletedState);
      onUpdateTask({ ...task, checklist: updatedChecklist }); 
    } catch (error) {
      console.error("Failed to toggle checklist item in DB:", error);
      // Revert optimistic update if needed (more robust error handling)
      // For now, local state remains optimistically updated.
    }
  }, [task, onUpdateTask, onToggleChecklistItemDB]);

  const handleUpdateChecklistItemText = useCallback(async (itemId: string, newText: string) => {
    try {
      await onUpdateChecklistItemTextDB(task.id, itemId, newText);
      const updatedChecklist = task.checklist.map(item =>
        item.id === itemId ? { ...item, text: newText } : item
      );
      // Text update doesn't change completed status, so existing sort order within groups is maintained.
      // If it could, re-sorting would be needed: sortChecklistItemsInternal(updatedChecklist)
      onUpdateTask({ ...task, checklist: updatedChecklist });
    } catch (error) {
      console.error("Failed to update checklist item text in DB:", error);
    }
  },[task, onUpdateTask, onUpdateChecklistItemTextDB]);
  
  const handleDeleteChecklistItem = useCallback(async (itemId: string) => {
    try {
      await onDeleteChecklistItemDB(task.id, itemId);
      let updatedChecklist = task.checklist.filter(item => item.id !== itemId);
      // No need to re-sort here as relative order of remaining items doesn't change based on deletion itself.
      // The overall task completion status might change, triggering re-sort of tasks in App.tsx.
      onUpdateTask({ ...task, checklist: updatedChecklist });
    } catch (error) {
      console.error("Failed to delete checklist item from DB:", error);
    }
  }, [task, onUpdateTask, onDeleteChecklistItemDB]);

  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isCompleted = totalItems > 0 && completedItems === totalItems;

  const cardBaseClasses = "p-4 rounded-lg shadow-md mb-3 cursor-grab active:cursor-grabbing transition-all duration-150 font-['Roboto_Flex']";
  
  const titleClass = "text-black";
  const descriptionClass = "text-black"; 
  const iconClass = "text-black hover:text-purple-500"; 
  const iconDeleteClass = "text-black hover:text-red-500"; 
  const checklistLabelClass = "text-black";
  const itemTextClass = "text-black";
  const completedItemTextClass = "text-neutral-700";

  const cardNormalStateClasses = `${CARD_BACKGROUND_CLASS} hover:shadow-lg hover:shadow-yellow-500/30`;
  const progressTrackNormalClass = "bg-yellow-800"; 
  
  const cardCompletedStateClasses = "bg-emerald-800 border-2 border-emerald-500 hover:shadow-lg hover:shadow-emerald-400/40";
  const progressTrackCompletedClass = "bg-emerald-900";

  const sortedChecklistForDisplay = sortChecklistItemsInternal(task.checklist);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id, task.dayId)}
      className={`${cardBaseClasses} ${isCompleted ? cardCompletedStateClasses : cardNormalStateClasses}`}
      aria-label={`Tarefa: ${task.title}, ${isCompleted ? 'Concluída' : 'Pendente'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-md ${titleClass} break-words`}>{task.title}</h3>
        <div className="flex space-x-1 flex-shrink-0">
          <IconButton onClick={() => onEdit(task)} ariaLabel={`Editar tarefa ${task.title}`}>
            <EditIcon className={`w-4 h-4 ${iconClass}`} />
          </IconButton>
          <IconButton onClick={() => onDelete(task.id, task.dayId)} ariaLabel={`Excluir tarefa ${task.title}`}>
            <TrashIcon className={`w-4 h-4 ${iconDeleteClass}`} />
          </IconButton>
        </div>
      </div>

      {task.description && (
        <p className={`text-sm ${descriptionClass} mb-3 break-words`}>{task.description}</p>
      )}

      {task.checklist && task.checklist.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-medium ${checklistLabelClass}`}>
              Checklist ({completedItems}/{totalItems})
            </span>
          </div>
          <div className={`w-full ${isCompleted ? progressTrackCompletedClass : progressTrackNormalClass} rounded-full h-1.5 mb-2`} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`${isCompleted ? 'bg-emerald-400' : 'bg-purple-500'} h-1.5 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {sortedChecklistForDisplay.map((item: ChecklistItem) => (
              <ChecklistItemDisplay
                key={item.id}
                item={item}
                onToggle={handleToggleChecklistItem}
                onUpdateText={handleUpdateChecklistItemText}
                onDelete={handleDeleteChecklistItem}
                itemTextColorClass={itemTextClass}
                completedTextColorClass={completedItemTextClass}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
