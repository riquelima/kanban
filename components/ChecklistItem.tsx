import React from 'react';
import { ChecklistItemType, DayOfWeekId } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ChecklistItemProps {
  item: ChecklistItemType;
  dayId: DayOfWeekId;
  taskId: string;
  onToggle: (dayId: DayOfWeekId, taskId: string, checklistItemId: string) => void;
  onDelete: (dayId: DayOfWeekId, taskId: string, checklistItemId: string) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, dayId, taskId, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center justify-between p-2 my-1 rounded ${item.completed ? 'bg-green-700 bg-opacity-30' : 'bg-gray-700'}`}>
      <div className="flex items-center flex-grow min-w-0"> {/* Added flex-grow and min-w-0 for long text */}
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle(dayId, taskId, item.id)}
          className="mr-3 h-5 w-5 text-yellow-500 border-gray-500 rounded focus:ring-yellow-400 focus:ring-offset-gray-800 bg-gray-600"
          aria-labelledby={`checklist-item-label-${item.id}`}
        />
        <span 
          id={`checklist-item-label-${item.id}`}
          className={`flex-grow break-words ${item.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}
        >
          {item.text}
        </span>
      </div>
      <button
        onClick={() => onDelete(dayId, taskId, item.id)}
        className="text-red-400 hover:text-red-300 p-1 ml-2 rounded-full hover:bg-red-700 hover:bg-opacity-40 transition-colors flex-shrink-0"
        aria-label={`Delete checklist item: ${item.text}`}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChecklistItem;