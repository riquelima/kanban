
import React from 'react';
import { Task, StageKey } from '../types'; 
import { STAGES_CONFIG as defaultStagesConfig, PRIORITY_STYLES as defaultPriorityStyles } from '../constants';
import IconButton from './IconButton';

// Icons
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

interface RowViewProps {
  tasks: Task[];
  stagesConfig: typeof defaultStagesConfig;
  priorityStyles: typeof defaultPriorityStyles;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const RowView: React.FC<RowViewProps> = ({ tasks, stagesConfig, priorityStyles, onEditTask, onDeleteTask }) => {
  if (!tasks || tasks.length === 0) {
    return <div className="text-center text-slate-500 dark:text-[#9CA3AF] py-10 text-sm" style={{ animation: 'fadeIn 0.3s ease-out' }}>Nenhuma tarefa para exibir.</div>;
  }
  
  const getStageDisplayInfo = (stageId: StageKey) => {
    const stage = stagesConfig.find(s => s.id === stageId);
    return {
      name: stage?.name || stageId,
      dotColor: stage?.dotColor || 'bg-gray-400',
    };
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-[#2A2A2E] shadow-md dark:shadow-md dark:shadow-black/10 rounded-xl dark:border dark:border-[#3C3C43]" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-[#3C3C43]">
        <thead className="bg-gray-50 dark:bg-[#26262B]">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">Título</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">Status</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">Prioridade</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">Checklist</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#2A2A2E] divide-y divide-gray-200 dark:divide-[#3C3C43]">
          {tasks.map(task => {
            const priorityInfo = (task.priority && priorityStyles[task.priority]) ? priorityStyles[task.priority] : priorityStyles["Default"];
            const completedChecklistItems = task.checklist.filter(item => item.completed).length;
            const totalChecklistItems = task.checklist.length;
            const stageDisplay = getStageDisplayInfo(task.stageId);

            return (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-[#323236] transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-[#E5E7EB] truncate max-w-xs" title={task.title}>{task.title}</div>
                  {task.description && <div className="text-xs text-gray-500 dark:text-[#9CA3AF] truncate max-w-xs" title={task.description}>{task.description}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 ${stageDisplay.dotColor} rounded-full mr-2`}></span>
                    <span className="text-sm text-gray-700 dark:text-[#E5E7EB]">{stageDisplay.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {task.priority && (
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${priorityInfo.pill} ${priorityInfo.text}`}>
                      {priorityInfo.display}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-[#9CA3AF]">
                  {totalChecklistItems > 0 ? `${completedChecklistItems}/${totalChecklistItems}` : 'N/A'}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <IconButton onClick={() => onEditTask(task)} ariaLabel={`Editar ${task.title}`} className="p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]">
                      <EditIcon className="w-4 h-4 text-slate-500 hover:text-indigo-500 dark:text-[#D1D5DB] dark:opacity-90 dark:hover:text-white dark:hover:opacity-100" />
                    </IconButton>
                    <IconButton onClick={() => onDeleteTask(task.id)} ariaLabel={`Excluir ${task.title}`} className="p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]">
                      <TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-500 dark:text-[#D1D5DB] dark:opacity-90 dark:hover:text-red-400 dark:hover:opacity-100" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RowView;
