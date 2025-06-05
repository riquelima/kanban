import React, { useState, useEffect } from 'react';
import { ChecklistItemType, DayOfWeekId, EditingTaskDetails, TaskCardType } from '../types';
import ChecklistItem from './ChecklistItem';
import PlusIcon from './icons/PlusIcon';

interface ChecklistModalProps {
  editingTaskDetails: EditingTaskDetails | null;
  onClose: () => void;
  onAddChecklistItem: (dayId: DayOfWeekId, taskId: string, text: string) => void;
  onToggleChecklistItem: (dayId: DayOfWeekId, taskId: string, checklistItemId: string) => void;
  onDeleteChecklistItem: (dayId: DayOfWeekId, taskId: string, checklistItemId: string) => void;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({
  editingTaskDetails,
  onClose,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
}) => {
  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  useEffect(() => {
    if (!editingTaskDetails) {
      setNewChecklistItemText('');
    }
  }, [editingTaskDetails]);

  if (!editingTaskDetails) {
    return null;
  }

  const { dayId, task } = editingTaskDetails;

  const handleAdd = () => {
    if (newChecklistItemText.trim() === '') return;
    onAddChecklistItem(dayId, task.id, newChecklistItemText.trim());
    setNewChecklistItemText('');
  };
  
  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isTaskCompleted = totalItems > 0 && completedItems === totalItems;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-100">{task.name} - Checklist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-3xl font-light"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        {totalItems > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progresso</span>
              <span>{completedItems}/{totalItems}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`${isTaskCompleted ? 'bg-green-500' : 'bg-yellow-500'} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mb-4 flex">
          <input
            type="text"
            value={newChecklistItemText}
            onChange={(e) => setNewChecklistItemText(e.target.value)}
            placeholder="Adicionar item ao checklist..."
            className="flex-grow bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 p-2 rounded-l-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-r-md flex items-center justify-center transition-colors"
            aria-label="Add checklist item"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-1">
          {task.checklist.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum item no checklist ainda.</p>
          ) : (
            task.checklist.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                dayId={dayId}
                taskId={task.id}
                onToggle={onToggleChecklistItem}
                onDelete={onDeleteChecklistItem}
              />
            ))
          )}
        </div>
        <button
            onClick={onClose}
            className="mt-6 bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold py-2 px-4 rounded-md w-full transition-colors"
          >
            Fechar
          </button>
      </div>
    </div>
  );
};

export default ChecklistModal;