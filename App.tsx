
import React, { useState, useEffect, useCallback } from 'react';
import { ColumnData, Task, DayKey, ChecklistItem, User } from './types';
import { INITIAL_COLUMNS, DAYS_OF_WEEK } from './constants';
import Column from './components/Column';
import TaskModal from './components/TaskModal';
import LoginScreen from './components/LoginScreen'; // Importa a tela de Login
import { supabase, DbTask, DbChecklistItem, DbUser } from './supabaseClient';

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 12.75h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm3-3h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Zm-6-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm-3-3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Z" />
  </svg>
);

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0_3-3m0 0-3-3m3 3H9" />
  </svg>
);

// Helper to determine if a task is fully completed
const isTaskFullyCompleted = (task: Task): boolean => {
  if (!task.checklist || task.checklist.length === 0) {
    return false; // Task with no checklist items is not considered "completed" by items.
  }
  return task.checklist.every(item => item.completed);
};

// Helper to sort checklist items
const sortChecklistItems = (checklist: ChecklistItem[]): ChecklistItem[] => {
  return [...checklist].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Uncompleted (false) items first
    }
    const timeA = a.created_at ? new Date(a.created_at).getTime() : Infinity;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : Infinity;
    if (timeA === Infinity && timeB === Infinity) return 0;
    return timeA - timeB; // Older items first within the same completion group
  });
};

// Helper to sort tasks
const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aCompleted = isTaskFullyCompleted(a);
    const bCompleted = isTaskFullyCompleted(b);
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1; // Uncompleted tasks first
    }
    // If completion status is the same, sort by creation time (older first)
    const timeA = a.created_at ? new Date(a.created_at).getTime() : Infinity; // New tasks last if no timestamp
    const timeB = b.created_at ? new Date(b.created_at).getTime() : Infinity;
    if (timeA === Infinity && timeB === Infinity && a.id && b.id) return a.id.localeCompare(b.id); // Fallback for new tasks
    if (timeA === Infinity && timeB === Infinity) return 0;


    return timeA - timeB;
  });
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [columns, setColumns] = useState<ColumnData[]>(INITIAL_COLUMNS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultDayForNewTask, setDefaultDayForNewTask] = useState<DayKey>(DayKey.MONDAY);

  const [draggedItem, setDraggedItem] = useState<{taskId: string; sourceDayId: DayKey} | null>(null);
  const [draggingOverColumn, setDraggingOverColumn] = useState<DayKey | null>(null);
  const [focusedColumnId, setFocusedColumnId] = useState<DayKey | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('currentUser');
      }
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = async (username: string, passwordAttempt: string) => {
    setLoginError(null);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, password')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        setLoginError('Usuário não encontrado.');
        return;
      }

      if (userData.password === passwordAttempt) {
        const loggedInUser: User = { id: userData.id, username: userData.username };
        setCurrentUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      } else {
        setLoginError('Senha incorreta.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Ocorreu um erro durante o login.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setColumns(INITIAL_COLUMNS); 
    setError(null);
    setLoginError(null);
    setFocusedColumnId(null);
  };

  const mapDbTaskToTask = (dbTask: DbTask, checklistItems: DbChecklistItem[]): Task => {
    const taskChecklist = checklistItems
      .filter(item => item.task_id === dbTask.id)
      .map(ci => ({
        id: ci.id,
        text: ci.text,
        completed: ci.completed,
        created_at: ci.created_at,
        updated_at: ci.updated_at,
        task_id: ci.task_id,
      }));
      
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || undefined,
      dayId: dbTask.day_id,
      user_id: dbTask.user_id || undefined,
      checklist: sortChecklistItems(taskChecklist), // Sort checklist items here
      created_at: dbTask.created_at,
      updated_at: dbTask.updated_at,
    };
  };

  const fetchBoardData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true }); 

      if (tasksError) throw tasksError;

      const taskIds = (tasksData || []).map(t => t.id);
      let checklistItemsData: DbChecklistItem[] = [];
      if (taskIds.length > 0) {
        const { data: ciData, error: checklistItemsError } = await supabase
          .from('checklist_items')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', {ascending: true}); // Fetch checklist items sorted by creation
        if (checklistItemsError) throw checklistItemsError;
        checklistItemsData = ciData || [];
      }
      
      const newColumns = DAYS_OF_WEEK.map(dayInfo => {
        const dayTasksRaw = (tasksData || [])
          .filter((task: DbTask) => task.day_id === dayInfo.id)
          .map((dbTask: DbTask) => mapDbTaskToTask(dbTask, checklistItemsData));
        return {
          id: dayInfo.id,
          name: dayInfo.name,
          tasks: sortTasks(dayTasksRaw), // Sort tasks within the column
        };
      });
      setColumns(newColumns);
    } catch (err: any) {
      console.error("Error fetching board data:", err);
      setError(`Falha ao carregar dados: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchBoardData();
    } else {
      setColumns(INITIAL_COLUMNS);
      setIsLoading(false);
    }
  }, [currentUser, fetchBoardData]);


  const handleOpenModalForNew = useCallback((dayId: DayKey) => {
    if (!currentUser) return;
    setTaskToEdit(null);
    setDefaultDayForNewTask(dayId);
    setIsModalOpen(true);
  }, [currentUser]);

  const handleOpenModalForEdit = useCallback((task: Task) => {
    if (!currentUser) return;
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, [currentUser]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  }, []);

  const handleSaveTask = useCallback(async (taskDataFromModal: Task) => {
    if (!currentUser) {
      setError("Nenhum usuário logado. Não é possível salvar a tarefa.");
      return;
    }
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
            // updated_at will be set by supabase
          })
          .eq('id', taskId)
          .eq('user_id', currentUser.id); 
        if (taskUpdateError) throw taskUpdateError;

      } else { 
        const { data: newTaskDB, error: taskInsertError } = await supabase
          .from('tasks')
          .insert({
            id: taskId, 
            title: taskDataFromModal.title,
            description: taskDataFromModal.description,
            day_id: taskDataFromModal.dayId,
            user_id: currentUser.id, 
            // created_at and updated_at will be set by supabase
          })
          .select()
          .single();
        if (taskInsertError) throw taskInsertError;
        if (!newTaskDB) throw new Error("Falha ao criar tarefa ou recuperá-la.");
      }
      
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
      
      if (taskDataFromModal.checklist.length > 0) {
        const itemsToUpsert = taskDataFromModal.checklist.map(modalItem => ({
            id: modalItem.id, 
            task_id: taskId,
            text: modalItem.text,
            completed: modalItem.completed,
            // created_at and updated_at for checklist items handled by supabase
        }));
        const { error: upsertCiError } = await supabase
            .from('checklist_items')
            .upsert(itemsToUpsert, { onConflict: 'id' });
        if (upsertCiError) throw upsertCiError;
      }

      await fetchBoardData(); 
    } catch (err: any) {
      let detailedMessage = "Ocorreu um erro desconhecido ao salvar a tarefa.";
      if (err && typeof err === 'object') {
        if (err.message) { detailedMessage = String(err.message); if (err.details) detailedMessage += ` Detalhes: ${err.details}`; if (err.hint) detailedMessage += ` Dica: ${err.hint}`; if (err.code) detailedMessage += ` (Código: ${err.code})`;
        } else { try { const errString = JSON.stringify(err); detailedMessage = (errString && errString !== '{}') ? errString : "O objeto de erro não continha uma mensagem legível."; } catch (e) { detailedMessage = "Erro ao converter objeto de erro."; } }
      } else if (typeof err === 'string') { detailedMessage = err; }
      console.error("Error saving task (raw object):", err);
      setError(`Falha ao salvar tarefa: ${detailedMessage}`);
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  }, [currentUser, taskToEdit, fetchBoardData, handleCloseModal]);

  const handleDeleteTask = useCallback(async (taskId: string, _dayId: DayKey) => {
    if (!currentUser) return;
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      setIsLoading(true);
      setError(null);
      try {
        // Cascade delete for checklist_items should be handled by DB foreign key constraint if set up,
        // otherwise, delete them manually first if needed. For now, assume cascade or orphan cleanup later.
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', currentUser.id); 
        if (deleteError) throw deleteError;
        await fetchBoardData(); 
      } catch (err: any) {
        let detailedMessage = "Ocorreu um erro desconhecido ao excluir a tarefa.";
        // ... (error message formatting as before)
        console.error("Error deleting task (raw object):", err);
        setError(`Falha ao excluir tarefa: ${detailedMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser, fetchBoardData]);

  const handleUpdateTaskLocal = useCallback((updatedTask: Task) => {
    if (!currentUser) return;
    setColumns(prevColumns => 
      prevColumns.map(col => {
        if (col.id === updatedTask.dayId) {
          const newTasksInColumn = col.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
          return { ...col, tasks: sortTasks(newTasksInColumn) }; // Re-sort tasks in this column
        }
        return col;
      })
    );
  }, [currentUser]);

  const dbToggleChecklistItem = async (taskId: string, itemId: string, completed: boolean) => {
    if (!currentUser) throw new Error("Usuário não logado.");
    const { error } = await supabase
      .from('checklist_items')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('task_id', taskId); 
    if (error) throw error;
    // No need to call fetchBoardData here if handleUpdateTaskLocal updates UI optimistically.
  };

  const dbUpdateChecklistItemText = async (taskId: string, itemId: string, text: string) => {
    if (!currentUser) throw new Error("Usuário não logado.");
     const { error } = await supabase
      .from('checklist_items')
      .update({ text, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('task_id', taskId);
    if (error) throw error;
  };

  const dbDeleteChecklistItem = async (taskId: string, itemId: string) => {
    if (!currentUser) throw new Error("Usuário não logado.");
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId)
      .eq('task_id', taskId);
    if (error) throw error;
  };

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string, sourceDayId: DayKey) => {
    if (!currentUser) return;
    setDraggedItem({ taskId, sourceDayId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId); 
    e.currentTarget.classList.add('dragging');
  }, [currentUser]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetDayId: DayKey) => {
    if (!currentUser) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (focusedColumnId && focusedColumnId !== targetDayId) return;
    setDraggingOverColumn(targetDayId);
  }, [currentUser, focusedColumnId]);
  
  const handleDragLeaveColumn = useCallback(() => {
     setDraggingOverColumn(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, targetDayId: DayKey) => {
    if (!currentUser || !draggedItem || (focusedColumnId && focusedColumnId !== targetDayId)) return;
    e.preventDefault();
    const { taskId, sourceDayId } = draggedItem;    
    
    document.querySelector('.dragging')?.classList.remove('dragging');
    setDraggedItem(null);
    setDraggingOverColumn(null);

    if (sourceDayId === targetDayId) return;

    const originalColumns = JSON.parse(JSON.stringify(columns)); 
    
    setColumns(prevColumns => {
      let taskToMove: Task | undefined;
      const colsAfterRemoval = prevColumns.map(col => {
        if (col.id === sourceDayId) {
          taskToMove = col.tasks.find(t => t.id === taskId);
          return { ...col, tasks: sortTasks(col.tasks.filter(t => t.id !== taskId)) };
        }
        return col;
      });

      if (!taskToMove) return prevColumns; // Should not happen if draggedItem is set

      return colsAfterRemoval.map(col => {
        if (col.id === targetDayId && taskToMove) {
          return { ...col, tasks: sortTasks([...col.tasks, { ...taskToMove, dayId: targetDayId }]) };
        }
        return col;
      });
    });
    
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ day_id: targetDayId, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('user_id', currentUser.id); 
      if (updateError) throw updateError;
      // Data is already optimistically updated and sorted.
      // A full fetchBoardData() could be called here for ultimate consistency if optimistic update is complex.
    } catch (err: any) {
      console.error("Error updating task dayId:", err);
      setError(`Falha ao mover tarefa: ${err.message || 'Erro desconhecido'}`);
      setColumns(originalColumns); // Revert to original state on error
    }
  }, [currentUser, draggedItem, focusedColumnId, columns]);
  
  const handleDragEnd = useCallback(() => {
    document.querySelector('.dragging')?.classList.remove('dragging');
    setDraggedItem(null);
    setDraggingOverColumn(null);
  }, []);

  const handleToggleFocusColumn = useCallback((dayId: DayKey) => {
    setFocusedColumnId(prevFocusedId => (prevFocusedId === dayId ? null : dayId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const unfocusColumn = useCallback(() => {
    setFocusedColumnId(null);
  }, []);


  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-neutral-300 bg-gray-950">Verificando sessão...</div>;
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} loginError={loginError} />;
  }
  
  const displayedColumns = focusedColumnId
    ? columns.filter(col => col.id === focusedColumnId)
    : columns;

  const isInitialBoardLoading = isLoading && columns.every(col => col.tasks.length === 0 && INITIAL_COLUMNS.find(initCol => initCol.id === col.id));
  if (isInitialBoardLoading && !error) { 
    return <div className="min-h-screen flex items-center justify-center text-xl text-neutral-300 bg-gray-950">Carregando planejamento...</div>;
  }
  
  if (error) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl text-red-400 p-4 bg-gray-950">
        <div className="bg-neutral-800 p-8 rounded-lg shadow-xl max-w-lg w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center text-red-300">Ocorreu um Erro no Quadro</h2>
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
        <div 
          className={`flex items-center justify-center space-x-3 relative ${focusedColumnId ? 'cursor-pointer' : ''}`}
          onClick={focusedColumnId ? unfocusColumn : undefined}
          title={focusedColumnId ? "Voltar ao dashboard (Clique para desfocar)" : ""}
        >
          <CalendarIcon className="w-10 h-10 text-purple-400" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 font-['Sigmar_One']">
            Planejamento Semanal
          </h1>
          <button 
            onClick={(e) => { e.stopPropagation(); handleLogout();}} 
            title="Sair"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-purple-400 transition-colors"
            aria-label="Sair"
          >
            <LogoutIcon className="w-7 h-7" />
          </button>
        </div>
        <p 
          className={`text-neutral-400 mt-2 ${focusedColumnId ? 'cursor-pointer' : ''}`}
          onClick={focusedColumnId ? unfocusColumn : undefined}
          title={focusedColumnId ? "Voltar ao dashboard (Clique para desfocar)" : ""}
        >
          Usuário: <span className="font-semibold text-purple-300">{currentUser.username}</span>. Organize suas tarefas da semana.
        </p>
      </header>
      
      <main className={`flex-grow ${focusedColumnId ? 'w-full relative' : 'overflow-x-auto'} pb-4`}>
        {focusedColumnId && (
            <div
                className="fixed inset-0 bg-black bg-opacity-60 z-20 transition-opacity duration-300 ease-in-out"
                onClick={unfocusColumn}
                aria-label="Fechar visualização focada"
                role="button" 
                tabIndex={-1} // Make it focusable for screen readers but not part of tab order
            />
        )}
        <div className={`flex ${focusedColumnId ? 'w-full justify-center relative z-30' : 'space-x-4 min-w-max'}`}>
          {displayedColumns.map(column => (
            <div 
              key={column.id} 
              onDragLeave={handleDragLeaveColumn}
              className={`${focusedColumnId ? 'w-full max-w-5xl' : ''}`}
            >
                <Column
                column={column} // column.tasks are now pre-sorted
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
