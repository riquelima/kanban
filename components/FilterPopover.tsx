
import React, { useState, useEffect, useRef } from 'react';
import { PRIORITY_STYLES, STAGES_CONFIG } from '../constants';
import { StageKey } from '../types';

export interface ActiveFilters {
  priorities: string[];
  statuses: StageKey[];
  keyword: string;
}

interface FilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: ActiveFilters;
  onApplyFilters: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(currentFilters.priorities);
  const [selectedStatuses, setSelectedStatuses] = useState<StageKey[]>(currentFilters.statuses);
  const [keyword, setKeyword] = useState<string>(currentFilters.keyword);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedPriorities(currentFilters.priorities);
    setSelectedStatuses(currentFilters.statuses);
    setKeyword(currentFilters.keyword);
  }, [currentFilters, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  const handlePriorityChange = (priorityKey: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priorityKey) ? prev.filter(p => p !== priorityKey) : [...prev, priorityKey]
    );
  };

  const handleStatusChange = (statusKey: StageKey) => {
    setSelectedStatuses(prev =>
      prev.includes(statusKey) ? prev.filter(s => s !== statusKey) : [...prev, statusKey]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      priorities: selectedPriorities,
      statuses: selectedStatuses,
      keyword: keyword.trim(),
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setKeyword('');
    onClearFilters();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-[#2A2A2E] rounded-xl shadow-2xl border border-slate-200 dark:border-[#3C3C43] z-30 p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-[#E5E7EB] mb-3">Filtrar Tarefas</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-[#9CA3AF] mb-1">Por Palavra-chave no Título</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Digite para filtrar..."
            className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-800 placeholder-gray-400 dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white dark:placeholder-[#9CA3AF] dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-[#9CA3AF] mb-1.5">Por Prioridade</label>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {Object.entries(PRIORITY_STYLES).map(([key, style]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-[#3C3C43] rounded-md">
                <input
                  type="checkbox"
                  checked={selectedPriorities.includes(key)}
                  onChange={() => handlePriorityChange(key)}
                  className="h-3.5 w-3.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 bg-white dark:bg-[#26262B] dark:border-[#3C3C43] dark:checked:bg-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-[#26262B]"
                />
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${style.pill} ${style.text}`}>
                  {style.display}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-[#9CA3AF] mb-1.5">Por Status</label>
          <div className="space-y-1">
            {STAGES_CONFIG.map(stage => (
              <label key={stage.id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-[#3C3C43] rounded-md">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(stage.id)}
                  onChange={() => handleStatusChange(stage.id)}
                  className="h-3.5 w-3.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 bg-white dark:bg-[#26262B] dark:border-[#3C3C43] dark:checked:bg-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-[#26262B]"
                />
                <span className="text-xs text-gray-700 dark:text-[#E5E7EB]">{stage.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-200 dark:border-[#3C3C43] flex justify-end space-x-2">
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-sm transition-colors dark:text-[#D1D5DB] dark:bg-[#3C3C43] dark:hover:bg-[#505058] dark:border-[#505058]"
        >
          Limpar Filtros
        </button>
        <button
          onClick={handleApply}
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors dark:filter dark:brightness-110 dark:hover:brightness-125"
        >
          Aplicar
        </button>
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FilterPopover;
