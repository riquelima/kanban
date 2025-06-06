
import React, { useState, useCallback } from 'react';
import { ChecklistItem } from '../types';
import IconButton from './IconButton';

interface ChecklistItemDisplayProps {
  item: ChecklistItem;
  onToggle: (itemId: string) => void;
  onUpdateText: (itemId: string, newText: string) => void;
  onDelete: (itemId: string) => void;
  itemTextColorClass?: string;
  completedTextColorClass?: string;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);


const ChecklistItemDisplay: React.FC<ChecklistItemDisplayProps> = ({ 
  item, 
  onToggle, 
  onUpdateText, 
  onDelete,
  itemTextColorClass, // This prop might be less relevant with fixed dark mode styles
  completedTextColorClass // Same as above
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleTextUpdate = useCallback(() => {
    if (editText.trim() !== item.text) {
      onUpdateText(item.id, editText.trim());
    }
    setIsEditing(false);
  }, [editText, item.text, item.id, onUpdateText]);

  // Default text colors for light theme, overridden by dark: prefixes
  const defaultItemTextColor = itemTextColorClass || 'text-gray-700 dark:text-[#E5E7EB]'; 
  const defaultCompletedItemTextColor = completedTextColorClass || 'text-gray-400 dark:text-[#9CA3AF]';

  return (
    <div className="flex items-center space-x-2 py-1 group">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        className="form-checkbox h-4 w-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 bg-white dark:bg-[#26262B] dark:border-[#3C3C43] dark:checked:bg-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-[#26262B]"
      />
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleTextUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleTextUpdate()}
          className="flex-grow bg-white text-sm text-gray-800 p-1 rounded border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:bg-[#202024] dark:text-white dark:border-[#3C3C43] dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-grow text-sm cursor-pointer ${item.completed ? `line-through ${defaultCompletedItemTextColor}` : defaultItemTextColor}`}
        >
          {item.text}
        </span>
      )}
      <IconButton 
        onClick={() => onDelete(item.id)} 
        ariaLabel="Deletar item do checklist"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]"
      >
        <TrashIcon className="w-3.5 h-3.5 text-red-500 hover:text-red-400 dark:text-red-500/80 dark:hover:text-red-500" />
      </IconButton>
    </div>
  );
};

export default ChecklistItemDisplay;
