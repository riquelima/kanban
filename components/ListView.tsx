
import React from 'react';
import { Task, StageKey, ChecklistItem, Assignee } from '../types';
import { STAGES_CONFIG as defaultStagesConfig, PRIORITY_STYLES as defaultPriorityStyles } from '../constants'; 
import IconButton from './IconButton';
import ChecklistItemDisplay from './ChecklistItemDisplay'; 

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
// AssigneeAvatar and ChatBubbleOvalLeftEllipsisIcon are removed as they are no longer used in this file.


interface ListViewProps {
  tasks: Task[];
  stagesConfig: typeof defaultStagesConfig;
  priorityStyles: typeof defaultPriorityStyles;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  onUpdateChecklistItemText: (taskId: string, itemId: string, newText: string) => Promise<void>;
  onDeleteChecklistItem: (taskId: string, itemId: string) => Promise<void>;
}

const ListView: React.FC<ListViewProps> = ({ 
    tasks, stagesConfig, priorityStyles, onEditTask, onDeleteTask,
    onToggleChecklistItem, onUpdateChecklistItemText, onDeleteChecklistItem
}) => {
  if (!tasks || tasks.length === 0) {
    return <div className="text-center text-slate-500 dark:text-[#9CA3AF] py-10 text-sm" style={{ animation: 'fadeIn 0.3s ease-out' }}>Nenhuma tarefa para exibir.</div>;
  }

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {stagesConfig.map(stage => {
        const tasksInStage = tasks.filter(t => t.stageId === stage.id);
        if (tasksInStage.length === 0) return null;

        return (
          <section key={stage.id} aria-labelledby={`stage-title-${stage.id}`}>
            <div className="flex items-center mb-4">
              <span className={`w-3 h-3 ${stage.dotColor} rounded-full mr-3`}></span>
              <h2 id={`stage-title-${stage.id}`} className="text-xl font-semibold text-gray-800 dark:text-[#F5F5F5]">{stage.name}</h2>
              <span className="ml-2 text-sm text-gray-500 bg-gray-200 dark:text-[#9CA3AF] dark:bg-[#3C3C43] px-2 py-0.5 rounded-full font-medium">
                {tasksInStage.length}
              </span>
            </div>
            <ul className="space-y-4">
              {tasksInStage.map(task => {
                const priorityInfo = (task.priority && priorityStyles[task.priority]) ? priorityStyles[task.priority] : priorityStyles["Default"];
                const completedChecklistItems = task.checklist.filter(item => item.completed).length;
                const totalChecklistItems = task.checklist.length;

                return (
                  <li key={task.id} className="bg-white dark:bg-[#2A2A2E] dark:border dark:border-[#3C3C43] p-4 rounded-xl shadow-md dark:shadow-md dark:shadow-black/10 hover:shadow-lg dark:hover:shadow-black/20 transition-shadow duration-150">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-base text-gray-800 dark:text-[#E5E7EB] break-words pr-2">{task.title}</h3>
                        {task.description && <p className="text-xs text-gray-600 dark:text-[#9CA3AF] mt-1">{task.description}</p>}
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        {task.priority && (
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${priorityInfo.pill} ${priorityInfo.text}`}>
                            {priorityInfo.display}
                          </span>
                        )}
                        <IconButton onClick={() => onEditTask(task)} ariaLabel={`Editar tarefa ${task.title}`} className="p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]">
                          <EditIcon className="w-4 h-4 text-slate-500 hover:text-indigo-500 dark:text-[#D1D5DB] dark:opacity-90 dark:hover:text-white dark:hover:opacity-100" />
                        </IconButton>
                        <IconButton onClick={() => onDeleteTask(task.id)} ariaLabel={`Excluir tarefa ${task.title}`} className="p-1 hover:bg-slate-100 dark:hover:bg-[#3C3C43]">
                          <TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-500 dark:text-[#D1D5DB] dark:opacity-90 dark:hover:text-red-400 dark:hover:opacity-100" />
                        </IconButton>
                      </div>
                    </div>

                    {task.checklist && task.checklist.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#3C3C43]">
                        <h4 className="text-xs font-medium text-gray-600 dark:text-[#9CA3AF] mb-1.5">Checklist ({completedChecklistItems}/{totalChecklistItems})</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                          {task.checklist.map(item => (
                            <ChecklistItemDisplay
                              key={item.id}
                              item={item}
                              onToggle={() => onToggleChecklistItem(task.id, item.id, !item.completed)}
                              onUpdateText={(itemId, newText) => onUpdateChecklistItemText(task.id, itemId, newText)}
                              onDelete={() => onDeleteChecklistItem(task.id, item.id)}
                              itemTextColorClass="text-gray-700 dark:text-[#E5E7EB]"
                              completedTextColorClass="text-gray-400 dark:text-[#9CA3AF]"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Assignees and comments section removed */}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ListView;
