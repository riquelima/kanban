

import React, { useState, useEffect, useCallback } from 'react';
import { ColumnData, Task, DayKey, ChecklistItem } from './types';
import { INITIAL_COLUMNS, DAYS_OF_WEEK } from './constants';
import Column from './components/Column';
import TaskModal from './components/TaskModal';
import { supabase, DbTask, DbChecklistItem } from './supabaseClient';

// Helper para gerar UUIDs no cliente
// const generateClientUUID = () => crypto.randomUUID(); // Não é mais necessário aqui, TaskModal gera

const App: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>(INITIAL_COLUMNS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultDayForNewTask, setDefaultDayForNewTask] = useState<DayKey>(DayKey.MONDAY);

  const [draggedItem, setDraggedItem] = useState<{taskId: string; sourceDayId: DayKey} | null>(null);
  const [draggingOverColumn, setDraggingOverColumn] = useState<DayKey | null>(null);
  const [focusedColumnId, setFocusedColumnId] = useState<DayKey | null>(null);

  const mapDbTaskToTask = (dbTask: DbTask, checklistItems: DbChecklistItem[]): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    dayId: dbTask.day_id,
    checklist: checklistItems
      .filter(item => item.task_id === dbTask.id)
      .map(ci => ({
        id: ci.id,
        text: ci.text,
        completed: ci.completed,
        created_at: ci.created_at,
        updated_at: ci.updated_at,
        task_id: ci.task_id,
      })).sort((a,b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()), // Ordena checklist por criação
    created_at: dbTask.created_at,
    updated_at: dbTask.updated_at,
  });

  const fetchBoardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true }); 

      if (tasksError) throw tasksError;

      const { data: checklistItemsData, error: checklistItemsError } = await supabase
        .from('checklist_items')
        .select('*');
      
      if (checklistItemsError) throw checklistItemsError;

      const newColumns = DAYS_OF_WEEK.map(dayInfo => {
        const dayTasks = (tasksData || [])
          .filter((task: DbTask) => task.day_id === dayInfo.id) // Este filtro é case-sensitive
          .map((dbTask: DbTask) => mapDbTaskToTask(dbTask, checklistItemsData || []));
        return {
          id: dayInfo.id,
          name: dayInfo.name,
          tasks: dayTasks,
        };
      });
      setColumns(newColumns);
    } catch (err: any) {
      console.error("Error fetching board data:", err);
      let errorMessage = "Falha ao carregar dados do quadro.";
      if (err && err.message) {
        errorMessage = `Falha ao carregar dados: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);


  const handleOpenModalForNew = useCallback((dayId: DayKey) => {
    setTaskToEdit(null);
    setDefaultDayForNewTask(dayId);
    setIsModalOpen(true);
  }, []);

  const handleOpenModalForEdit = useCallback((task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  }, []);

  const handleSaveTask = useCallback(async (taskDataFromModal: Task) => {
    setIsLoading(true); 
    const isEditing = !!taskToEdit;
    const taskId = taskDataFromModal.id; 

    try {
      if (isEditing) { 
        const { error: taskUpdateError } = await supabase
          .from('tasks')
          .update({
            title: taskDataFromModal.title,
            description: taskDataFromModal.description,
            day_id: taskDataFromModal.dayId,
            // updated_at será atualizado pelo trigger do DB
          })
          .eq('id', taskId);
        if (taskUpdateError) throw taskUpdateError;

        const { data: currentDbChecklistItems, error: fetchCiError } = await supabase
            .from('checklist_items')
            .select('id')
            .eq('task_id', taskId);
        if (fetchCiError) throw fetchCiError;

        const dbItemIds = currentDbChecklistItems?.map(ci => ci.id) || [];
        const modalItemIds = taskDataFromModal.checklist.map(ci => ci.id);

        const itemsToDelete = dbItemIds.filter(id => !modalItemIds.includes(id));
        if (itemsToDelete.length > 0) {
            const { error: deleteCiError } = await supabase
                .from('checklist_items')
                .delete()
                .in('id', itemsToDelete);
            if (deleteCiError) throw deleteCiError;
        }
        
        for (const modalItem of taskDataFromModal.checklist) {
            const itemPayload = {
                id: modalItem.id, 
                task_id: taskId,
                text: modalItem.text,
                completed: modalItem.completed,
            };
            const { error: upsertCiError } = await supabase
                .from('checklist_items')
                .upsert(itemPayload, { onConflict: 'id' }); // Garante que id seja o conflict target
            if (upsertCiError) throw upsertCiError;
        }

      } else { 
        const { data: newTaskDB, error: taskInsertError } = await supabase
          .from('tasks')
          .insert({
            id: taskId, 
            title: taskDataFromModal.title,
            description: taskDataFromModal.description,
            day_id: taskDataFromModal.dayId,
          })
          .select()
          .single();
        if (taskInsertError) throw taskInsertError;
        if (!newTaskDB) throw new Error("Falha ao criar tarefa ou recuperá-la após a criação.");

        if (taskDataFromModal.checklist.length > 0) {
          const checklistItemsToInsert = taskDataFromModal.checklist.map(item => ({
            id: item.id, 
            task_id: newTaskDB.id,
            text: item.text,
            completed: item.completed,
          }));
          const { error: clInsertError } = await supabase
            .from('checklist_items')
            .insert(checklistItemsToInsert);
          if (clInsertError) throw clInsertError;
        }
      }
      await fetchBoardData(); 
    } catch (err: any) {
      let detailedMessage = "Ocorreu um erro desconhecido ao salvar a tarefa.";
      if (err && typeof err === 'object') {
        if (err.message) { // Prioriza a mensagem de erro da biblioteca Supabase/PostgREST
          detailedMessage = String(err.message);
          if (err.details) detailedMessage += ` Detalhes: ${err.details}`;
          if (err.hint) detailedMessage += ` Dica: ${err.hint}`;
          if (err.code) detailedMessage += ` (Código: ${err.code})`;
        } else { // Fallback se o objeto de erro não tiver .message
          try {
            const errString = JSON.stringify(err);
            if (errString && errString !== '{}') { 
                 detailedMessage = errString; // Usa a string JSON se ela não for um objeto vazio
            } else {
                 detailedMessage = "O objeto de erro não continha uma mensagem legível ou era um objeto vazio.";
            }
          } catch (e) {
            detailedMessage = "Erro ao tentar converter o objeto de erro para string.";
          }
        }
      } else if (typeof err === 'string') {
        detailedMessage = err; // Se o erro lançado for uma string simples
      }
      
      console.error("Error saving task (raw object):", err); // Log para depuração
      setError(`Falha ao salvar tarefa: ${detailedMessage}`);
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  }, [taskToEdit, fetchBoardData, handleCloseModal]);

  const handleDeleteTask = useCallback(async (taskId: string, _dayId: DayKey) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      setIsLoading(true);
      setError(null); // Limpa erros anteriores
      try {
        // A exclusão de checklist_items é tratada por ON DELETE CASCADE no DB
        const { error: deleteError } = await supabase.from('tasks').delete().eq('id', taskId);
        if (deleteError) throw deleteError;
        await fetchBoardData(); 
      } catch (err: any) {
        let detailedMessage = "Ocorreu um erro desconhecido ao excluir a tarefa.";
        if (err && typeof err === 'object') {
          if (err.message) { 
            detailedMessage = String(err.message);
            if (err.details) detailedMessage += ` Detalhes: ${err.details}`;
            if (err.hint) detailedMessage += ` Dica: ${err.hint}`;
            if (err.code) detailedMessage += ` (Código: ${err.code})`;
          } else {
            try {
              const errString = JSON.stringify(err);
              detailedMessage = (errString && errString !== '{}') ? errString : "O objeto de erro não continha uma mensagem legível ou era um objeto vazio.";
            } catch (e) {
              detailedMessage = "Erro ao tentar converter o objeto de erro para string.";
            }
          }
        } else if (typeof err === 'string') {
          detailedMessage = err;
        }
        
        console.error("Error deleting task (raw object):", err);
        setError(`Falha ao excluir tarefa: ${detailedMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  }, [fetchBoardData]);

  const handleUpdateTaskLocal = useCallback((updatedTask: Task) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === updatedTask.dayId 
          ? { ...col, tasks: col.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) } 
          : col
      )
    );
  }, []);

  const dbToggleChecklistItem = async (taskId: string, itemId: string, completed: boolean) => {
    const { error } = await supabase
      .from('checklist_items')
      .update({ completed })
      .eq('id', itemId)
      .eq('task_id', taskId); 
    if (error) {
      console.error("DB Toggle Error:", error);
      throw error;
    }
  };

  const dbUpdateChecklistItemText = async (taskId: string, itemId: string, text: string) => {
     const { error } = await supabase
      .from('checklist_items')
      .update({ text })
      .eq('id', itemId)
      .eq('task_id', taskId);
    if (error) {
      console.error("DB Update Text Error:", error);
      throw error;
    }
  };

  const dbDeleteChecklistItem = async (taskId: string, itemId: string) => {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId)
      .eq('task_id', taskId);
    if (error) {
      console.error("DB Delete Item Error:", error);
      throw error;
    }
  };


  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string, sourceDayId: DayKey) => {
    setDraggedItem({ taskId, sourceDayId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId); 
    e.currentTarget.classList.add('dragging');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetDayId: DayKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (focusedColumnId && focusedColumnId !== targetDayId) return;
    setDraggingOverColumn(targetDayId);
  }, [focusedColumnId]);
  
  const handleDragLeaveColumn = useCallback(() => {
     setDraggingOverColumn(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, targetDayId: DayKey) => {
    e.preventDefault();
    if (!draggedItem || (focusedColumnId && focusedColumnId !== targetDayId)) return;

    const { taskId, sourceDayId } = draggedItem;
    
    const draggedElement = document.querySelector('.dragging');
    if (draggedElement) draggedElement.classList.remove('dragging');

    setDraggedItem(null);
    setDraggingOverColumn(null);

    if (sourceDayId === targetDayId) return;

    let taskToMove: Task | undefined;
    const originalColumns = JSON.parse(JSON.stringify(columns)); 

    setColumns(prevColumns => {
      const newCols = prevColumns.map(col => ({...col, tasks: [...col.tasks]})); 
      const sourceCol = newCols.find(col => col.id === sourceDayId);
      const targetCol = newCols.find(col => col.id === targetDayId);

      if (sourceCol && targetCol) {
        taskToMove = sourceCol.tasks.find(t => t.id === taskId);
        if (taskToMove) {
          sourceCol.tasks = sourceCol.tasks.filter(t => t.id !== taskId);
          targetCol.tasks.push({ ...taskToMove, dayId: targetDayId });
        }
      }
      return newCols;
    });
    
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ day_id: targetDayId })
        .eq('id', taskId);
      if (updateError) throw updateError;
      // Chamada fetchBoardData() aqui pode ser considerada se você quiser garantir
      // que o estado local está 100% sincronizado com o DB após o drag,
      // incluindo `updated_at`. No entanto, para a mudança de `day_id`, a
      // atualização otimista é geralmente suficiente.
      // await fetchBoardData(); 
    } catch (err: any) {
      console.error("Error updating task dayId:", err);
      let errorMessage = "Falha ao mover tarefa.";
        if (err && err.message) {
            errorMessage = `Falha ao mover tarefa: ${err.message}`;
        }
      setError(errorMessage);
      setColumns(originalColumns); 
    }
  }, [draggedItem, focusedColumnId, columns]);
  
  const handleDragEnd = useCallback(() => {
    const draggedElement = document.querySelector('.dragging');
    if (draggedElement) draggedElement.classList.remove('dragging');
    setDraggedItem(null);
    setDraggingOverColumn(null);
  }, []);

  const handleToggleFocusColumn = useCallback((dayId: DayKey) => {
    setFocusedColumnId(prevFocusedId => (prevFocusedId === dayId ? null : dayId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const displayedColumns = focusedColumnId
    ? columns.filter(col => col.id === focusedColumnId)
    : columns;

  if (isLoading && columns.every(col => col.tasks.length === 0 && INITIAL_COLUMNS.find(initCol => initCol.id === col.id))) { 
    return <div className="min-h-screen flex items-center justify-center text-xl text-neutral-300">Carregando planejamento...</div>;
  }
  
  if (error) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl text-red-400 p-4 bg-gray-950">
        <div className="bg-neutral-800 p-8 rounded-lg shadow-xl max-w-lg w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center text-red-300">Ocorreu um Erro</h2>
          <pre className="text-sm text-neutral-200 bg-neutral-700 p-4 rounded-md whitespace-pre-wrap max-w-full overflow-x-auto">
            {error}
          </pre>
          <button 
            onClick={() => { setError(null); fetchBoardData(); }}
            className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
     );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-950 selection:bg-purple-500 selection:text-white" onDragEnd={handleDragEnd}>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
          Planejamento Semanal
        </h1>
        <p className="text-neutral-400 mt-2">Organize suas tarefas da semana com facilidade.</p>
      </header>

      <main className={`flex-grow ${focusedColumnId ? 'w-full' : 'overflow-x-auto'} pb-4`}>
        <div className={`flex ${focusedColumnId ? 'w-full justify-center' : 'space-x-4 min-w-max'}`}>
          {displayedColumns.map(column => (
            <div 
              key={column.id} 
              onDragLeave={handleDragLeaveColumn}
              className={`${focusedColumnId ? 'w-full max-w-5xl' : ''}`}
            >
                <Column
                column={column}
                onAddTask={handleOpenModalForNew}
                onEditTask={handleOpenModalForEdit}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTaskLocal} 
                onDragStartTask={handleDragStart}
                onDragOverColumn={handleDragOver}
                onDropTaskInColumn={handleDrop}
                isDraggingOver={draggingOverColumn === column.id && (!focusedColumnId || focusedColumnId === column.id)}
                onToggleFocus={handleToggleFocusColumn}
                isFocused={focusedColumnId === column.id}
                onToggleChecklistItemDB={dbToggleChecklistItem}
                onUpdateChecklistItemTextDB={dbUpdateChecklistItemText}
                onDeleteChecklistItemDB={dbDeleteChecklistItem}
                />
            </div>
          ))}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask} 
        taskToEdit={taskToEdit}
        defaultDayId={defaultDayForNewTask}
      />
      <footer className="text-center text-sm text-neutral-600 mt-8 py-4 border-t border-neutral-800">
        Dados armazenados com <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Supabase</a>.
      </footer>
    </div>
  );
};

export default App;
