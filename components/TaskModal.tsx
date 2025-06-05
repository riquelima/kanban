
import React, { useState, useEffect, useCallback } from 'react';
import { Task, ChecklistItem, DayKey } from '../types';
import { ACCENT_COLOR_CLASS } from '../constants';
import IconButton from './IconButton';
import ChecklistItemDisplay from './ChecklistItemDisplay';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit?: Task | null;
  defaultDayId: DayKey;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Usa crypto.randomUUID() para gerar IDs compatíveis com UUID do Supabase
const generateId = () => crypto.randomUUID();

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit, defaultDayId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setChecklist(taskToEdit.checklist.map(item => ({...item, id: item.id || generateId()}))); // Garante que itens do checklist tenham ID
    } else {
      setTitle('');
      setDescription('');
      setChecklist([]);
    }
  }, [taskToEdit, isOpen]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      alert("O título da tarefa é obrigatório.");
      return;
    }
    const taskData: Task = {
      id: taskToEdit?.id || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      checklist: checklist.map(item => ({...item, id: item.id || generateId()})), // Garante IDs para novos itens
      dayId: taskToEdit?.dayId || defaultDayId,
    };
    onSave(taskData);
    onClose();
  }, [title, description, checklist, taskToEdit, defaultDayId, onSave, onClose]);

  const addChecklistItem = useCallback(() => {
    if (newChecklistItemText.trim()) {
      setChecklist(prev => [...prev, { id: generateId(), text: newChecklistItemText.trim(), completed: false }]);
      setNewChecklistItemText('');
    }
  }, [newChecklistItemText]);

  const toggleChecklistItem = useCallback((itemId: string) => {
    setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item));
  }, []);
  
  const updateChecklistItemText = useCallback((itemId: string, newText: string) => {
    setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, text: newText } : item));
  }, []);

  const deleteChecklistItem = useCallback((itemId: string) => {
    setChecklist(prev => prev.filter(item => item.id !== itemId));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-100">{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-neutral-300 mb-1">Título</label>
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de planejamento"
              className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-neutral-300 mb-1">Descrição (opcional)</label>
            <textarea
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Discutir próximos passos do projeto X..."
              rows={3}
              className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <h3 className="text-md font-medium text-neutral-300 mb-2">Checklist</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
              {checklist.map(item => (
                <ChecklistItemDisplay 
                  key={item.id} 
                  item={item} 
                  onToggle={toggleChecklistItem}
                  onUpdateText={updateChecklistItemText}
                  onDelete={deleteChecklistItem}
                />
              ))}
            </div>
            <div className="flex items-center mt-2 space-x-2">
              <input
                type="text"
                value={newChecklistItemText}
                onChange={(e) => setNewChecklistItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                placeholder="Adicionar item ao checklist"
                className="flex-grow p-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
              />
              <button 
                onClick={addChecklistItem} 
                className={`p-2 rounded-md ${ACCENT_COLOR_CLASS} text-white text-sm`}
                disabled={!newChecklistItemText.trim()}
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm font-medium text-white ${ACCENT_COLOR_CLASS} rounded-md transition-colors`}
          >
            {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
