
import React, { useEffect, useRef } from 'react';
import { SortType, SORT_OPTIONS } from '../constants';

interface SortPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortType;
  onApplySort: (sortType: SortType) => void;
  onClearSort: () => void;
}

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);


const SortPopover: React.FC<SortPopoverProps> = ({
  isOpen,
  onClose,
  currentSort,
  onApplySort,
  onClearSort,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleSelectSort = (sortType: SortType) => {
    onApplySort(sortType);
    onClose();
  };
  
  const handleClear = () => {
    onClearSort();
  }

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#2A2A2E] rounded-xl shadow-2xl border border-slate-200 dark:border-[#3C3C43] z-30 py-2"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div className="px-2 py-1 mb-1">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider px-2">Ordenar Por</h3>
      </div>
      {SORT_OPTIONS.map(option => (
        <button
          key={option.key}
          onClick={() => handleSelectSort(option.key)}
          className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-colors ${
            currentSort === option.key ? 'bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-700/30 dark:text-indigo-300' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-[#E5E7EB] dark:hover:bg-[#3C3C43] dark:hover:text-white'
          }`}
        >
          {option.label}
          {currentSort === option.key && <CheckIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />}
        </button>
      ))}
      {currentSort && (
        <>
          <div className="my-1 border-t border-gray-200 dark:border-[#3C3C43] mx-2"></div>
          <button
            onClick={handleClear}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-[#E5E7EB] dark:hover:bg-[#3C3C43] dark:hover:text-white transition-colors"
          >
            Limpar Ordenação
          </button>
        </>
      )}
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SortPopover;
