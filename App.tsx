
import React, { useState, useEffect, useCallback } from 'react';
import { DayColumnType, TaskCardType, ChecklistItemType, DayOfWeekId, EditingTaskDetails } from './types';
import { DAYS_OF_WEEK_NAMES } from './constants';
import Board from './components/Board';
import ChecklistModal from './components/ChecklistModal';
import { supabase, SupabaseDay, SupabaseTask, SupabaseChecklistItem } from './supabaseClient'; // Import Supabase client and types

const App: React.FC = () => {
  const [boardData, setBoardData] = useState<DayColumnType[]>([]);
  const [editingTaskDetails, setEditingTaskDetails] = useState<EditingTaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allChecklistItems, setAllChecklistItems] = useState<SupabaseChecklistItem[]>([]);


  const fetchBoardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: daysData, error: daysError } = await supabase
        .from('days')
        .select('*')
        .order('created_at', { ascending: true }); 

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      const { data: checklistItemsData, error: checklistError } = await supabase
        .from('checklist_items')
        .select('*');

      if (daysError) throw daysError;
      if (tasksError) throw tasksError;
      if (checklistError) throw checklistError;

      const typedTasksData = tasksData as SupabaseTask[];
      const typedChecklistItemsData = checklistItemsData as SupabaseChecklistItem[];
      setAllChecklistItems(typedChecklistItemsData); 
      
      const tasksWithChecklists: TaskCardType[] = typedTasksData.map(task => ({
        id: task.id,
        name: task.name,
        checklist: typedChecklistItemsData
          .filter(item => item.task_id === task.id)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) 
          .map(ci => ({ id: ci.id, text: ci.text, completed: ci.completed })), 
      }));

      const newBoardData = DAYS_OF_WEEK_NAMES.map(dayInfo => {
        const dayFromSupabase = (daysData as SupabaseDay[])?.find(d => d.id === dayInfo.id);
        return {
          id: dayInfo.id,
          title: dayFromSupabase?.title || dayInfo.title, 
          tasks: tasksWithChecklists
            .filter(task => {
              const supabaseTask = typedTasksData.find(st => st.id === task.id);
              return supabaseTask?.day_id === dayInfo.id;
            })
            .sort((a,b) => {
                const taskA = typedTasksData.find(t => t.id === a.id);
                const taskB = typedTasksData.find(t => t.id === b.id);
                if(taskA && taskB) {
                    return new Date(taskA.created_at).getTime() - new Date(taskB.created_at).getTime();
                }
                return 0;
            }),
        };
      });
      
      setBoardData(newBoardData);

    } catch (e: any) {
      console.error("Error fetching board data:", e);
      setError(`Failed to load data: ${e.message}. Ensure Supabase tables are set up and RLS policies allow access.`);
      setBoardData(DAYS_OF_WEEK_NAMES.map(day => ({
        id: day.id,
        title: day.title,
        tasks: [],
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleAddTask = async (dayId: DayOfWeekId, taskName: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ day_id: dayId, name: taskName }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned after insert");

      const newTaskSupabase = data as SupabaseTask;
      const newTask: TaskCardType = {
        id: newTaskSupabase.id,
        name: newTaskSupabase.name,
        checklist: [],
      };

      setBoardData(prevBoardData =>
        prevBoardData.map(day =>
          day.id === dayId ? { ...day, tasks: [...day.tasks, newTask] } : day
        )
      );
    } catch (e: any) {
      console.error("Error adding task:", e);
      setError(`Failed to add task: ${e.message}`);
    }
  };

  const handleDeleteTask = async (dayId: DayOfWeekId, taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setBoardData(prevBoardData =>
        prevBoardData.map(day =>
          day.id === dayId ? { ...day, tasks: day.tasks.filter(task => task.id !== taskId) } : day
        )
      );
      if (editingTaskDetails?.task.id === taskId) {
        setEditingTaskDetails(null);
      }
    } catch (e: any)
    {
      console.error("Error deleting task:", e);
      setError(`Failed to delete task: ${e.message}`);
    }
  };

  const handleOpenChecklistModal = (dayId: DayOfWeekId, task: TaskCardType) => {
    setEditingTaskDetails({ dayId, task });
  };

  const handleCloseChecklistModal = () => {
    setEditingTaskDetails(null);
  };

  const handleAddChecklistItem = async (dayId: DayOfWeekId, taskId: string, text: string) => {
    try {
      const { data: insertedItemData, error: insertError } = await supabase
        .from('checklist_items')
        .insert([{ task_id: taskId, text: text, completed: false }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedItemData) throw new Error("Failed to insert or retrieve the new checklist item.");

      const { data: allTaskChecklistItemsSupabase, error: fetchAllError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (fetchAllError) throw fetchAllError;
      
      const currentTaskChecklistItemsSupabase: SupabaseChecklistItem[] = allTaskChecklistItemsSupabase || [];
      
      const updatedChecklistForTask: ChecklistItemType[] = currentTaskChecklistItemsSupabase.map(ci => ({
        id: ci.id,
        text: ci.text,
        completed: ci.completed,
      }));

      setAllChecklistItems(prevAll => {
        const otherItems = prevAll.filter(item => item.task_id !== taskId);
        return [...otherItems, ...currentTaskChecklistItemsSupabase];
      });


      const updateTaskWithNewChecklist = (prevTask: TaskCardType): TaskCardType => ({
        ...prevTask,
        checklist: updatedChecklistForTask,
      });

      setBoardData(prevBoardData =>
        prevBoardData.map(day =>
          day.id === dayId
            ? {
                ...day,
                tasks: day.tasks.map(task =>
                  task.id === taskId
                    ? updateTaskWithNewChecklist(task)
                    : task
                ),
              }
            : day
        )
      );
      
      if (editingTaskDetails && editingTaskDetails.task.id === taskId) {
        setEditingTaskDetails(prevDetails => prevDetails ? ({
            ...prevDetails,
            task: updateTaskWithNewChecklist(prevDetails.task)
        }) : null);
      }
    } catch (e: any) {
      console.error("Error adding checklist item:", e);
      setError(`Failed to add checklist item: ${e.message}`);
    }
  };

  const handleToggleChecklistItem = async (dayId: DayOfWeekId, taskId: string, checklistItemId: string) => {
    try {
      const currentItem = boardData
        .find(d => d.id === dayId)?.tasks
        .find(t => t.id === taskId)?.checklist
        .find(ci => ci.id === checklistItemId);

      if (!currentItem) return;

      const { data, error } = await supabase
        .from('checklist_items')
        .update({ completed: !currentItem.completed })
        .eq('id', checklistItemId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned after update");

      const updatedItemSupabase = data as SupabaseChecklistItem;

      const updateBoardAndModal = (prevTask: TaskCardType) => ({
        ...prevTask,
        checklist: prevTask.checklist.map(item =>
            item.id === checklistItemId
              ? { ...item, completed: updatedItemSupabase.completed }
              : item
          )
      });

      setBoardData(prevBoardData =>
        prevBoardData.map(day =>
          day.id === dayId
            ? {
                ...day,
                tasks: day.tasks.map(task =>
                  task.id === taskId
                    ? updateBoardAndModal(task)
                    : task
                ),
              }
            : day
        )
      );
      
      if (editingTaskDetails && editingTaskDetails.task.id === taskId) {
        setEditingTaskDetails(prevDetails => prevDetails ? ({
            ...prevDetails,
            task: updateBoardAndModal(prevDetails.task)
        }) : null);
      }
    } catch (e: any) {
      console.error("Error toggling checklist item:", e);
      setError(`Failed to toggle checklist item: ${e.message}`);
    }
  };

  const handleDeleteChecklistItem = async (dayId: DayOfWeekId, taskId: string, checklistItemId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', checklistItemId);

      if (error) throw error;

      const updateBoardAndModal = (prevTask: TaskCardType) => ({
        ...prevTask,
        checklist: prevTask.checklist.filter(item => item.id !== checklistItemId)
      });
      
      setBoardData(prevBoardData =>
        prevBoardData.map(day =>
          day.id === dayId
            ? {
                ...day,
                tasks: day.tasks.map(task =>
                  task.id === taskId
                    ? updateBoardAndModal(task)
                    : task
                ),
              }
            : day
        )
      );
      
      if (editingTaskDetails && editingTaskDetails.task.id === taskId) {
        setEditingTaskDetails(prevDetails => prevDetails ? ({
            ...prevDetails,
            task: updateBoardAndModal(prevDetails.task)
        }) : null);
      }
    } catch (e: any) {
      console.error("Error deleting checklist item:", e);
      setError(`Failed to delete checklist item: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        <p className="mt-4 text-lg text-gray-300">Carregando quadro...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 text-gray-100 p-4 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-sigmar-one text-center">
          <span className="text-teal-400">Planejamento Semanal</span>
          <span role="img" aria-label="calendar icon" className="ml-2 text-orange-400">🗓️</span>
        </h1>
      </header>
      {error && (
        <div className="bg-red-800 border-l-4 border-red-500 text-red-100 p-4 m-4 rounded-md" role="alert">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}
      <main className="flex-grow overflow-hidden">
        <Board
          boardData={boardData}
          onAddTask={handleAddTask}
          onOpenChecklist={handleOpenChecklistModal}
          onDeleteTask={handleDeleteTask}
        />
      </main>
      {editingTaskDetails && (
        <ChecklistModal
          editingTaskDetails={editingTaskDetails}
          onClose={handleCloseChecklistModal}
          onAddChecklistItem={handleAddChecklistItem}
          onToggleChecklistItem={handleToggleChecklistItem}
          onDeleteChecklistItem={handleDeleteChecklistItem}
        />
      )}
    </div>
  );
};

export default App;
