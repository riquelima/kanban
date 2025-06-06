
import React, { useState, useEffect, useCallback } from 'react';
import { Task, ChecklistItem, StageKey, Assignee } from '../types';
import { STAGES_CONFIG, PRIORITY_STYLES } from '../constants';
import IconButton from './IconButton';
import ChecklistItemDisplay from './ChecklistItemDisplay';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit?: Task | null;
  defaultStageId: StageKey; 
  dbToggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  dbUpdateChecklistItemText: (taskId: string, itemId: string, newText: string) => Promise<void>;
  dbDeleteChecklistItem: (taskId: string, itemId: string) => Promise<void>;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const generateId = () => crypto.randomUUID();

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, onClose, onSave, taskToEdit, defaultStageId,
  dbToggleChecklistItem, dbUpdateChecklistItemText, dbDeleteChecklistItem 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [currentStageId, setCurrentStageId] = useState<StageKey>(defaultStageId);
  const [currentPriority, setCurrentPriority] = useState<string>(Object.keys(PRIORITY_STYLES)[0]); 

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setChecklist(taskToEdit.checklist.map(item => ({...item, id: item.id || generateId()})));
      setCurrentStageId(taskToEdit.stageId);
      setCurrentPriority(taskToEdit.priority || Object.keys(PRIORITY_STYLES)[0]);
    } else {
      setTitle('');
      setDescription('');
      setChecklist([]);
      setCurrentStageId(defaultStageId);
      setCurrentPriority(Object.keys(PRIORITY_STYLES)[0]);
    }
  }, [taskToEdit, isOpen, defaultStageId]);

  const handleSave = useCallback(() => {
    if (!title.trim()) { alert("O título da tarefa é obrigatório."); return; }
    const taskData: Task = {
      id: taskToEdit?.id || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      checklist: checklist.map(item => ({...item, id: item.id || generateId()})),
      stageId: currentStageId,
      priority: currentPriority, 
      assignees: taskToEdit?.assignees || [], 
      commentsCount: taskToEdit?.commentsCount || 0,
    };
    onSave(taskData);
    onClose();
  }, [title, description, checklist, currentStageId, currentPriority, taskToEdit, onSave, onClose]);

  const addChecklistItem = useCallback(() => {
    if (newChecklistItemText.trim()) {
      setChecklist(prev => [...prev, { id: generateId(), text: newChecklistItemText.trim(), completed: false }]);
      setNewChecklistItemText('');
    }
  }, [newChecklistItemText]);

  const toggleChecklistItem = useCallback(async (itemId: string) => {
    const itemToToggle = checklist.find(i => i.id === itemId);
    if (!itemToToggle || !taskToEdit) return; 
    
    const newCompletedState = !itemToToggle.completed;
    setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, completed: newCompletedState } : item));
    try {
      await dbToggleChecklistItem(taskToEdit.id, itemId, newCompletedState);
    } catch (e) { console.error("Error toggling item in DB", e); }
  }, [checklist, taskToEdit, dbToggleChecklistItem]);
  
  const updateChecklistItemText = useCallback(async (itemId: string, newText: string) => {
    if (!taskToEdit) return;
    setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, text: newText } : item));
     try {
      await dbUpdateChecklistItemText(taskToEdit.id, itemId, newText);
    } catch (e) { console.error("Error updating item text in DB", e); }
  }, [taskToEdit, dbUpdateChecklistItemText]);

  const deleteChecklistItem = useCallback(async (itemId: string) => {
    if (!taskToEdit) return;
    setChecklist(prev => prev.filter(item => item.id !== itemId));
    try {
      await dbDeleteChecklistItem(taskToEdit.id, itemId);
    } catch (e) { console.error("Error deleting item from DB", e); }
  }, [taskToEdit, dbDeleteChecklistItem]);


  if (!isOpen) return null;
  
  const currentStageConfig = STAGES_CONFIG.find(s => s.id === currentStageId);
  const currentStageAccentClasses = currentStageConfig?.accentColor || 'bg-indigo-500 hover:bg-indigo-600';


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white dark:bg-[#2A2A2E] dark:border dark:border-[#3C3C43] p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-[#F5F5F5]">{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-1">Título</label>
            <input id="taskTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de planejamento"
              className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white dark:placeholder-[#9CA3AF] dark:focus:ring-indigo-500 dark:focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-1">Descrição (opcional)</label>
            <textarea id="taskDescription" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Discutir próximos passos do projeto X..." rows={3}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white dark:placeholder-[#9CA3AF] dark:focus:ring-indigo-500 dark:focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskStage" className="block text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-1">Status</label>
              <select id="taskStage" value={currentStageId} onChange={(e) => setCurrentStageId(e.target.value as StageKey)}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white">
                {STAGES_CONFIG.map(stage => <option key={stage.id} value={stage.id} className="dark:bg-[#26262B] dark:text-white">{stage.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-1">Prioridade</label>
              <select id="taskPriority" value={currentPriority} onChange={(e) => setCurrentPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white">
                {Object.keys(PRIORITY_STYLES).map(pKey => (
                  <option key={pKey} value={pKey} className="dark:bg-[#26262B] dark:text-white">{PRIORITY_STYLES[pKey].display}</option>
                ))}
              </select>
            </div>
          </div>


          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-2">Checklist</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-2 border border-gray-200 rounded-lg p-2 bg-slate-50 dark:bg-[#26262B] dark:border-[#3C3C43]">
              {checklist.map(item => (
                <ChecklistItemDisplay 
                  key={item.id} item={item} 
                  onToggle={toggleChecklistItem}
                  onUpdateText={updateChecklistItemText}
                  onDelete={deleteChecklistItem}
                  itemTextColorClass="text-gray-700 dark:text-[#E5E7EB]" // Base classes for light, dark specific here
                  completedTextColorClass="text-gray-400 dark:text-[#9CA3AF]"
                />
              ))}
            </div>
            <div className="flex items-center mt-2 space-x-2">
              <input type="text" value={newChecklistItemText} onChange={(e) => setNewChecklistItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()} placeholder="Adicionar item ao checklist"
                className="flex-grow p-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white dark:placeholder-[#9CA3AF] dark:focus:ring-indigo-500 dark:focus:border-indigo-500" />
              <button 
                onClick={addChecklistItem} 
                className={`p-2 rounded-lg ${currentStageAccentClasses} text-white text-sm transition-colors dark:filter dark:brightness-110 dark:hover:brightness-125`} 
                disabled={!newChecklistItemText.trim()}
                aria-label="Adicionar item ao checklist"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-gray-300 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:text-[#D1D5DB] dark:bg-[#3C3C43] dark:hover:bg-[#505058] dark:border-[#505058] dark:focus:ring-offset-[#2A2A2E]"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className={`px-4 py-2 text-sm font-medium text-white ${currentStageAccentClasses} rounded-lg shadow-sm transition-colors dark:filter dark:brightness-110 dark:hover:brightness-125`}
          >
            {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
