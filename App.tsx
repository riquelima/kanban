
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ColumnData, Task, StageKey, ChecklistItem, User, ReleaseUpdate, Assignee } from './types';
import { INITIAL_COLUMNS, STAGES_CONFIG, PRIORITY_STYLES, PRIORITY_ORDER, SortType, SORT_OPTIONS } from './constants';
import Column from './components/Column';
import TaskModal from './components/TaskModal';
import LoginScreen from './components/LoginScreen';
import WhatsNewPopup from './components/WhatsNewPopup';
import ListView from './components/ListView';
import RowView from './components/RowView';
import FilterPopover, { ActiveFilters } from './components/FilterPopover';
import SortPopover from './components/SortPopover';
import ThemeToggleButton from './components/ThemeToggleButton'; // Added ThemeToggleButton
import { supabase, DbTask, DbChecklistItem, DbUser, DbReleaseUpdate, DbUserUpdateView } from './supabaseClient';

// Heroicons SVGs
const Squares2X2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
  </svg>
);
const Bars3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const ViewColumnsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);
const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);
const FunnelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
);
const ArrowsUpDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
);

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0_3-3m0 0-3-3m3 3H9" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
  </svg>
);


export type ViewMode = 'column' | 'list' | 'compactColumn' | 'row';


const sortChecklistItems = (checklist: ChecklistItem[]): ChecklistItem[] => {
  return [...checklist].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const timeA = a.created_at ? new Date(a.created_at).getTime() : Infinity;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : Infinity;
    if (timeA === Infinity && timeB === Infinity) return 0;
    return timeA - timeB;
  });
};

// Initial sort for tasks when fetched
const initialSortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : Infinity;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : Infinity;
    if (timeA === Infinity && timeB === Infinity && a.id && b.id) return a.id.localeCompare(b.id);
    if (timeA === Infinity && timeB === Infinity) return 0;
    return timeA - timeB;
  });
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [columns, setColumns] = useState<ColumnData[]>(INITIAL_COLUMNS);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultStageForNewTask, setDefaultStageForNewTask] = useState<StageKey>(StageKey.TODO);

  const [draggedItem, setDraggedItem] = useState<{taskId: string; sourceStageId: StageKey} | null>(null);
  const [draggingOverColumn, setDraggingOverColumn] = useState<StageKey | null>(null);

  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [whatsNewDetails, setWhatsNewDetails] = useState<ReleaseUpdate | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('column');

  // Filter and Sort State
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ priorities: [], statuses: [], keyword: '' });
  const [activeSort, setActiveSort] = useState<SortType>(null);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);

  // For List and Row views that show a flat list of tasks
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>([]);

  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('currentUser');
      }
    }
    setAuthLoading(false);
  }, []);

  const checkAndShowWhatsNew = useCallback(async (user: User) => {
    try {
      const { data: latestUpdateData, error: latestUpdateError } = await supabase
        .from('release_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestUpdateError && latestUpdateError.code !== 'PGRST116') {
        console.error("Error fetching latest release update:", latestUpdateError);
        return;
      }
      if (!latestUpdateData) return;

      const currentRelease: ReleaseUpdate = latestUpdateData as DbReleaseUpdate;

      const { data: viewData, error: viewError } = await supabase
        .from('user_update_views')
        .select('*')
        .eq('user_id', user.id)
        .eq('release_update_id', currentRelease.id)
        .single();

      if (viewError && viewError.code !== 'PGRST116') {
        console.error("Error fetching user update view:", viewError);
        return;
      }

      let loginCountForThisUpdate = viewData ? (viewData as DbUserUpdateView).login_count_for_update : 0;

      if (loginCountForThisUpdate < 3) {
        setWhatsNewDetails(currentRelease);
        setIsWhatsNewOpen(true);

        if (viewData) {
          await supabase
            .from('user_update_views')
            .update({
              login_count_for_update: loginCountForThisUpdate + 1,
              last_seen_at: new Date().toISOString()
            })
            .eq('id', (viewData as DbUserUpdateView).id);
        } else {
          await supabase
            .from('user_update_views')
            .insert({
              user_id: user.id,
              release_update_id: currentRelease.id,
              login_count_for_update: 1,
              last_seen_at: new Date().toISOString()
            });
        }
      }
    } catch (err) { console.error("Error in checkAndShowWhatsNew:", err); }
  }, [setWhatsNewDetails, setIsWhatsNewOpen, supabase]);


  const handleLogin = async (username: string, passwordAttempt: string) => {
    setLoginError(null);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, password')
        .eq('username', username)
        .single();

      if (userError || !userData) { setLoginError('Usuário não encontrado.'); return; }

      if (userData.password === passwordAttempt) {
        const loggedInUser: User = { id: userData.id, username: userData.username };
        setCurrentUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        await checkAndShowWhatsNew(loggedInUser);
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
    setAllTasks([]);
    setDisplayedTasks([]);
    setActiveFilters({ priorities: [], statuses: [], keyword: '' });
    setActiveSort(null);
    setError(null);
    setLoginError(null);
    setIsWhatsNewOpen(false);
    setWhatsNewDetails(null);
    setActiveView('column');
  };

  const mockAssigneesData = useMemo(() => [
    { id: 'user1', initials: 'UX', avatarUrl: `https://i.pravatar.cc/40?u=${crypto.randomUUID()}`, name: 'Alex Doe' },
    { id: 'user2', initials: 'AI', avatarUrl: `https://i.pravatar.cc/40?u=${crypto.randomUUID()}`, name: 'Jamie Lan' },
    { id: 'user3', initials: 'DV', avatarUrl: `https://i.pravatar.cc/40?u=${crypto.randomUUID()}`, name: 'Casey Kin' },
    { id: 'user4', initials: 'PM', avatarUrl: `https://i.pravatar.cc/40?u=${crypto.randomUUID()}`, name: 'Morgan Lee' },
    { id: 'user5', initials: 'QA', avatarUrl: `https://i.pravatar.cc/40?u=${crypto.randomUUID()}`, name: 'Riley Zee' },
  ], []);

  const priorityKeysForMocking = useMemo(() => Object.keys(PRIORITY_STYLES).filter(k => k !== "Default"), []);


  const mapDbTaskToTask = useCallback((dbTask: DbTask, checklistItems: DbChecklistItem[]): Task => {
    const taskChecklist = checklistItems
      .filter(item => item.task_id === dbTask.id)
      .map(ci => ({ ...ci, task_id: ci.task_id }));

    const randomPriorityKey = dbTask.priority || priorityKeysForMocking[Math.floor(Math.random() * priorityKeysForMocking.length)];
    const numAssignees = Math.floor(Math.random() * (mockAssigneesData.length + 1));
    const shuffledAssignees = [...mockAssigneesData].sort(() => 0.5 - Math.random());
    const selectedAssignees = shuffledAssignees.slice(0, numAssignees);
    const commentsCount = Math.random() > 0.3 ? Math.floor(Math.random() * 50) +1 : 0;

    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || undefined,
      stageId: dbTask.day_id as StageKey,
      user_id: dbTask.user_id || undefined,
      checklist: sortChecklistItems(taskChecklist),
      created_at: dbTask.created_at,
      updated_at: dbTask.updated_at,
      priority: randomPriorityKey,
      assignees: selectedAssignees,
      commentsCount: commentsCount,
    };
  }, [mockAssigneesData, priorityKeysForMocking]);

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
          .order('created_at', {ascending: true});
        if (checklistItemsError) throw checklistItemsError;
        checklistItemsData = ciData || [];
      }

      const mappedTasks = (tasksData || []).map((dbTask: DbTask) => mapDbTaskToTask(dbTask, checklistItemsData));
      setAllTasks(initialSortTasks(mappedTasks));
    } catch (err: any) {
      console.error("Error fetching board data:", err);
      setError(`Falha ao carregar dados: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setIsLoading, setError, supabase, mapDbTaskToTask, setAllTasks]);

  useEffect(() => {
    if (currentUser) {
      fetchBoardData();
    } else {
      setColumns(INITIAL_COLUMNS);
      setAllTasks([]);
      setDisplayedTasks([]);
      setIsLoading(false);
    }
  }, [currentUser, fetchBoardData]);

  // Apply filters and sorting
  useEffect(() => {
    let tasksToProcess = [...allTasks];

    // Apply Filters
    if (activeFilters.priorities.length > 0) {
      tasksToProcess = tasksToProcess.filter(task => task.priority && activeFilters.priorities.includes(task.priority));
    }
    if (activeFilters.statuses.length > 0) {
      tasksToProcess = tasksToProcess.filter(task => activeFilters.statuses.includes(task.stageId));
    }
    if (activeFilters.keyword) {
      const lowerKeyword = activeFilters.keyword.toLowerCase();
      tasksToProcess = tasksToProcess.filter(task => task.title.toLowerCase().includes(lowerKeyword));
    }

    // Apply Sorting
    const sortFn = (a: Task, b: Task): number => {
      switch (activeSort) {
        case 'alphabetical-asc':
          return a.title.localeCompare(b.title);
        case 'alphabetical-desc':
          return b.title.localeCompare(a.title);
        case 'priority':
          return (PRIORITY_ORDER[a.priority || 'Default'] || 99) - (PRIORITY_ORDER[b.priority || 'Default'] || 99);
        case 'comments':
          return (b.commentsCount || 0) - (a.commentsCount || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          // Default sort by creation date (already applied in initialSortTasks if no sort selected)
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
    };

    if (activeView === 'list' || activeView === 'row') {
      setDisplayedTasks([...tasksToProcess].sort(sortFn));
    } else { // 'column' or 'compactColumn'
      const newColumns = STAGES_CONFIG.map(stageInfo => {
        const stageTasksRaw = tasksToProcess.filter(task => task.stageId === stageInfo.id);
        return {
          id: stageInfo.id,
          name: stageInfo.name,
          tasks: [...stageTasksRaw].sort(sortFn), // Sort tasks within each column
          accentColor: stageInfo.accentColor,
          dotColor: stageInfo.dotColor,
        };
      });
      setColumns(newColumns);
    }
  }, [allTasks, activeFilters, activeSort, activeView, setDisplayedTasks, setColumns]);


  const handleOpenModalForNew = useCallback((stageId: StageKey) => {
    if (!currentUser) return;
    setTaskToEdit(null);
    setDefaultStageForNewTask(stageId);
    setIsModalOpen(true);
  }, [currentUser, setTaskToEdit, setDefaultStageForNewTask, setIsModalOpen]);

  const handleOpenModalForEdit = useCallback((task: Task) => {
    if (!currentUser) return;
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, [currentUser, setTaskToEdit, setIsModalOpen]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  }, [setIsModalOpen, setTaskToEdit]);

  const handleSaveTask = useCallback(async (taskDataFromModal: Task) => {
    if (!currentUser) { setError("Nenhum usuário logado."); return; }
    setIsLoading(true);
    const isEditing = !!taskToEdit;
    const taskId = taskDataFromModal.id;

    try {
      const taskPayload: Partial<DbTask> & { day_id: StageKey } = {
        title: taskDataFromModal.title,
        description: taskDataFromModal.description,
        day_id: taskDataFromModal.stageId,
        priority: taskDataFromModal.priority,
      };

      if (isEditing) {
        const { error: taskUpdateError } = await supabase
          .from('tasks')
          .update(taskPayload)
          .eq('id', taskId)
          .eq('user_id', currentUser.id);
        if (taskUpdateError) throw taskUpdateError;
      } else {
        const { data: newTaskDB, error: taskInsertError } = await supabase
          .from('tasks')
          .insert({
            id: taskId,
            ...taskPayload,
            user_id: currentUser.id,
            created_at: new Date().toISOString(), // Ensure created_at is set for new tasks
          } as DbTask)
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
          await supabase.from('checklist_items').delete().in('id', itemsToDelete);
      }

      if (taskDataFromModal.checklist.length > 0) {
        const itemsToUpsert = taskDataFromModal.checklist.map(modalItem => ({
            id: modalItem.id, task_id: taskId, text: modalItem.text, completed: modalItem.completed,
        }));
        await supabase.from('checklist_items').upsert(itemsToUpsert, { onConflict: 'id' });
      }
      await fetchBoardData();
    } catch (err: any) {
      setError(`Falha ao salvar tarefa: ${err.message}`);
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  }, [currentUser, taskToEdit, fetchBoardData, handleCloseModal, setIsLoading, setError, supabase]);

  const handleDeleteTask = useCallback(async (taskId: string, _stageId?: StageKey) => {
    if (!currentUser || !window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setIsLoading(true);
    setError(null);
    try {
      await supabase.from('checklist_items').delete().eq('task_id', taskId);
      await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', currentUser.id);
      await fetchBoardData();
    } catch (err: any) { 
      setError(`Falha ao excluir tarefa: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchBoardData, setIsLoading, setError, supabase]);

  const handleUpdateTaskLocal = useCallback((updatedTask: Task) => {
    if (!currentUser) return;
    setAllTasks(prevAllTasks =>
      prevAllTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    );
  }, [currentUser, setAllTasks]);

  const dbToggleChecklistItem = async (taskId: string, itemId: string, completed: boolean) => {
    if (!currentUser) throw new Error("Usuário não logado.");
    await supabase.from('checklist_items').update({ completed, updated_at: new Date().toISOString() }).eq('id', itemId).eq('task_id', taskId);
    setAllTasks(prev => prev.map(task => task.id === taskId ? {
      ...task,
      checklist: task.checklist.map(ci => ci.id === itemId ? {...ci, completed} : ci)
    } : task ));
  };
  const dbUpdateChecklistItemText = async (taskId: string, itemId: string, text: string) => {
     if (!currentUser) throw new Error("Usuário não logado.");
     await supabase.from('checklist_items').update({ text, updated_at: new Date().toISOString() }).eq('id', itemId).eq('task_id', taskId);
     setAllTasks(prev => prev.map(task => task.id === taskId ? {
      ...task,
      checklist: task.checklist.map(ci => ci.id === itemId ? {...ci, text} : ci)
    } : task ));
  };
  const dbDeleteChecklistItem = async (taskId: string, itemId: string) => {
    if (!currentUser) throw new Error("Usuário não logado.");
    await supabase.from('checklist_items').delete().eq('id', itemId).eq('task_id', taskId);
     setAllTasks(prev => prev.map(task => task.id === taskId ? {
      ...task,
      checklist: task.checklist.filter(ci => ci.id !== itemId)
    } : task ));
  };

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string, sourceStageId: StageKey) => {
    if (!currentUser) return;
    setDraggedItem({ taskId, sourceStageId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    e.currentTarget.classList.add('dragging');
  }, [currentUser, setDraggedItem]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, targetStageId: StageKey) => {
    if (!currentUser) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggingOverColumn(targetStageId);
  }, [currentUser, setDraggingOverColumn]);

  const handleDragLeaveColumn = useCallback(() => {
     setDraggingOverColumn(null);
  }, [setDraggingOverColumn]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, targetStageId: StageKey) => {
    if (!currentUser || !draggedItem) return;
    e.preventDefault();
    const { taskId, sourceStageId } = draggedItem;

    document.querySelector('.dragging')?.classList.remove('dragging');
    setDraggedItem(null);
    setDraggingOverColumn(null);

    if (sourceStageId === targetStageId) return;

    const taskToMove = allTasks.find(t => t.id === taskId);
    if (taskToMove) {
        setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, stageId: targetStageId, updated_at: new Date().toISOString() } : t));
    }

    try {
      await supabase.from('tasks').update({ day_id: targetStageId, updated_at: new Date().toISOString() })
        .eq('id', taskId).eq('user_id', currentUser.id);
      // Consider if fetchBoardData() is needed here or if optimistic update + local sort/filter is enough
    } catch (err: any) {
      setError(`Falha ao mover tarefa: ${err.message}`);
      fetchBoardData(); // Refetch to ensure consistency on error
    }
  }, [currentUser, draggedItem, allTasks, supabase, setAllTasks, setError, fetchBoardData, setDraggedItem, setDraggingOverColumn]);

  const handleDragEnd = useCallback(() => {
    document.querySelector('.dragging')?.classList.remove('dragging');
    setDraggedItem(null);
    setDraggingOverColumn(null);
  }, [setDraggedItem, setDraggingOverColumn]);

  // Filter and Sort Handlers
  const handleApplyFilters = useCallback((filters: ActiveFilters) => {
    setActiveFilters(filters);
  }, [setActiveFilters]);
  const handleClearFilters = useCallback(() => {
    setActiveFilters({ priorities: [], statuses: [], keyword: '' });
  }, [setActiveFilters]);
  const handleApplySort = useCallback((sortType: SortType) => {
    setActiveSort(sortType);
  }, [setActiveSort]);
  const handleClearSort = useCallback(() => {
    setActiveSort(null);
  }, [setActiveSort]);

  const isFiltersActive = useMemo(() =>
    activeFilters.priorities.length > 0 || activeFilters.statuses.length > 0 || activeFilters.keyword !== '',
  [activeFilters]);


  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700 bg-gray-50 dark:bg-[#1B1B1F] dark:text-[#F5F5F5]">Verificando sessão...</div>;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} loginError={loginError} />;

  const isInitialBoardLoading = isLoading && columns.every(col => col.tasks.length === 0 && INITIAL_COLUMNS.find(initCol => initCol.id === col.id)) && allTasks.length === 0;
  if (isInitialBoardLoading && !error) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700 bg-gray-50 dark:bg-[#1B1B1F] dark:text-[#F5F5F5]">Carregando quadro...</div>;

  if (error) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl p-4 bg-gray-50 dark:bg-[#1B1B1F]">
        <div className="bg-white dark:bg-[#2A2A2E] p-8 rounded-xl shadow-xl max-w-lg w-full dark:border dark:border-[#3C3C43]">
          <h2 className="text-2xl font-semibold mb-4 text-center text-red-600 dark:text-red-400">Ocorreu um Erro</h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/30 p-4 rounded-md whitespace-pre-wrap max-w-full overflow-x-auto">{error}</pre>
          <button onClick={() => { setError(null); fetchBoardData(); }}
            className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:filter dark:brightness-110 dark:hover:brightness-125 transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>);
  }

  const viewButtonBaseClass = "flex items-center gap-x-1.5 py-2 text-sm font-medium transition-colors focus:outline-none";
  const activeViewStyles = "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400";
  const inactiveViewStyles = "text-gray-600 hover:text-indigo-600 border-b-2 border-transparent dark:text-gray-400 dark:hover:text-indigo-400";

  const actionButtonBaseClass = "flex items-center gap-x-1.5 text-sm font-medium transition-colors focus:outline-none dark:text-[#D1D5DB] dark:opacity-90 dark:hover:opacity-100";
  const activeActionButtonClass = "text-indigo-600 dark:text-indigo-400";
  const inactiveActionButtonClass = "text-gray-600 hover:text-indigo-600 dark:text-[#D1D5DB] dark:hover:text-white";


  return (
    <div className="min-h-screen flex flex-col" onDragEnd={handleDragEnd}>
      <header className="px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-200 bg-white dark:bg-[#1E1E1E] dark:border-[#3C3C43]">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-2">
              <CalendarDaysIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-[#F5F5F5]">Planejamento Semanal</h1>
            </div>
            <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-[#9CA3AF]">Usuário: <span className="font-medium text-indigo-600 dark:text-indigo-400">{currentUser.username}</span></span>
                <button
                    onClick={handleLogout}
                    title="Sair"
                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#3C3C43] transition-colors"
                    aria-label="Sair"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 pt-4 border-b border-slate-200 bg-white dark:bg-[#1E1E1E] dark:border-[#3C3C43] sticky top-0 z-20">
        <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-x-1 sm:gap-x-2 md:gap-x-3">
                <button className={`${viewButtonBaseClass} ${activeView === 'column' ? activeViewStyles : inactiveViewStyles}`} onClick={() => setActiveView('column')}>
                    <Squares2X2Icon className="w-4 h-4 icon-text-align" /> Grade
                </button>
                <button className={`${viewButtonBaseClass} ${activeView === 'list' ? activeViewStyles : inactiveViewStyles}`} onClick={() => setActiveView('list')}>
                    <Bars3Icon className="w-4 h-4 icon-text-align" /> Lista
                </button>
                <button className={`${viewButtonBaseClass} ${activeView === 'compactColumn' ? activeViewStyles : inactiveViewStyles}`} onClick={() => setActiveView('compactColumn')}>
                    <ViewColumnsIcon className="w-4 h-4 icon-text-align" /> Colunas
                </button>
                <button className={`${viewButtonBaseClass} ${activeView === 'row' ? activeViewStyles : inactiveViewStyles}`} onClick={() => setActiveView('row')}>
                    <ListBulletIcon className="w-4 h-4 icon-text-align" /> Linhas
                </button>
            </div>
            <div className="flex items-center gap-x-2 sm:gap-x-3 relative">
                <button
                  ref={filterButtonRef}
                  className={`${actionButtonBaseClass} ${isFiltersActive ? activeActionButtonClass : inactiveActionButtonClass} dark:filter dark:brightness-110 hover:dark:brightness-125`}
                  onClick={() => { setIsFilterPopoverOpen(prev => !prev); setIsSortPopoverOpen(false); }}
                >
                    <FunnelIcon className="w-4 h-4 icon-text-align" /> Filtrar
                </button>
                {isFilterPopoverOpen && (
                  <FilterPopover
                    isOpen={isFilterPopoverOpen}
                    onClose={() => setIsFilterPopoverOpen(false)}
                    currentFilters={activeFilters}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                  />
                )}
                <button
                  ref={sortButtonRef}
                  className={`${actionButtonBaseClass} ${activeSort ? activeActionButtonClass : inactiveActionButtonClass} dark:filter dark:brightness-110 hover:dark:brightness-125`}
                  onClick={() => { setIsSortPopoverOpen(prev => !prev); setIsFilterPopoverOpen(false); }}
                >
                    <ArrowsUpDownIcon className="w-4 h-4 icon-text-align" /> Ordenar
                </button>
                 {isSortPopoverOpen && (
                  <SortPopover
                    isOpen={isSortPopoverOpen}
                    onClose={() => setIsSortPopoverOpen(false)}
                    currentSort={activeSort}
                    onApplySort={handleApplySort}
                    onClearSort={handleClearSort}
                  />
                )}
            </div>
        </div>
      </div>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50 dark:bg-[#1B1B1F]">
        {activeView === 'list' && (
          <ListView
            tasks={displayedTasks}
            stagesConfig={STAGES_CONFIG}
            priorityStyles={PRIORITY_STYLES}
            onEditTask={handleOpenModalForEdit}
            onDeleteTask={handleDeleteTask}
            onToggleChecklistItem={dbToggleChecklistItem}
            onUpdateChecklistItemText={dbUpdateChecklistItemText}
            onDeleteChecklistItem={dbDeleteChecklistItem}
           />
        )}
        {activeView === 'row' && (
          <RowView
            tasks={displayedTasks}
            stagesConfig={STAGES_CONFIG}
            priorityStyles={PRIORITY_STYLES}
            onEditTask={handleOpenModalForEdit}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {(activeView === 'column' || activeView === 'compactColumn') && (
          <div className="flex space-x-4 min-w-max h-full overflow-x-auto">
            {isLoading && columns.every(c => c.tasks.length === 0) ? (
                 STAGES_CONFIG.map(stageInfo => ( // Render skeleton columns while loading
                    <div key={stageInfo.id} className={`flex-shrink-0 ${activeView === 'compactColumn' ? 'w-72 md:w-[300px]' : 'w-80 md:w-[350px]'} bg-gray-100 dark:bg-[#202024] rounded-2xl p-2 flex flex-col`}>
                         <div className="p-3 sticky top-0 z-10 bg-gray-100 dark:bg-[#202024] rounded-t-2xl">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                    <span className={`w-2.5 h-2.5 ${stageInfo.dotColor} rounded-full mr-2.5`}></span>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                                </div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 animate-pulse"></div>
                            </div>
                            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        </div>
                        <div className="px-2 pb-2 flex-grow overflow-y-auto">
                            <div className="h-20 bg-gray-200 dark:bg-gray-700/50 rounded-2xl animate-pulse mb-3"></div>
                            <div className="h-16 bg-gray-200 dark:bg-gray-700/50 rounded-2xl animate-pulse"></div>
                        </div>
                    </div>
                ))
            ) : columns.map(column => (
              <div key={column.id} onDragLeave={handleDragLeaveColumn} className="h-full">
                  <Column
                  column={column}
                  isCompact={activeView === 'compactColumn'}
                  onAddTask={handleOpenModalForNew}
                  onEditTask={handleOpenModalForEdit}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTaskLocal}
                  onDragStartTask={handleDragStart}
                  onDragOverColumn={handleDragOver}
                  onDropTaskInColumn={handleDrop}
                  isDraggingOver={draggingOverColumn === column.id}
                  />
              </div>
            ))}
          </div>
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultStageId={defaultStageForNewTask}
        dbToggleChecklistItem={dbToggleChecklistItem}
        dbUpdateChecklistItemText={dbUpdateChecklistItemText}
        dbDeleteChecklistItem={dbDeleteChecklistItem}
      />

      {whatsNewDetails && (
        <WhatsNewPopup
          isOpen={isWhatsNewOpen}
          onClose={() => setIsWhatsNewOpen(false)}
          title={whatsNewDetails.title}
          contentHtml={whatsNewDetails.content_html}
        />
      )}

      <ThemeToggleButton />

      <footer className="text-center text-xs text-slate-500 dark:text-[#9CA3AF] py-4 border-t border-slate-200 dark:border-[#3C3C43] bg-white dark:bg-[#1E1E1E]">
        Dados armazenados com <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:underline">Supabase</a>.
      </footer>
    </div>
  );
};

export default App;
