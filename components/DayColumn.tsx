
import React, { useState } from 'react';
import { DayColumnType, TaskCardType, DayOfWeekId } from '../types';
import TaskCard from './TaskCard';
import PlusIcon from './icons/PlusIcon';

interface DayColumnProps {
  day: DayColumnType;
  onAddTask: (dayId: DayOfWeekId, taskName: string) => void;
  onOpenChecklist: (dayId: DayOfWeekId, task: TaskCardType) => void;
  onDeleteTask: (dayId: DayOfWeekId, taskId: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({ day, onAddTask, onOpenChecklist, onDeleteTask }) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddTask = () => {
    if (newTaskName.trim() === '') return;
    onAddTask(day.id, newTaskName.trim());
    setNewTaskName('');
    setShowInput(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 md:p-4 flex-shrink-0 w-80 md:w-96 h-full flex flex-col shadow-lg">
      <h3 className="text-xl font-semibold text-gray-100 mb-3 text-center">{day.title}</h3>
      
      <div
        className="overflow-y-auto flex-grow mb-3 pr-1"
        style={{ minHeight: '100px' }} // Ensure area has some height even when empty
      >
        {day.tasks.length === 0 && !showInput && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhuma tarefa neste dia.</p>
        )}
        {day.tasks.map((task) => (
          <TaskCard 
            key={task.id}
            task={task} 
            dayId={day.id} 
            onOpenChecklist={onOpenChecklist}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      {showInput ? (
        <div className="mt-auto">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Nome da nova tarefa..."
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 p-2 rounded-md mb-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAddTask}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-3 rounded-md text-sm transition-colors"
            >
              Adicionar Tarefa
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mt-auto w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Tarefa
        </button>
      )}
    </div>
  );
};

export default DayColumn;
