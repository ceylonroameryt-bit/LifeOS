import { Task, Priority } from '@/types';
import { createClient } from '@/lib/supabase/client';

const LOCAL_STORAGE_KEY = 'lifeos_tasks_store';

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    user_id: 'guest',
    title: 'Gym',
    notes: 'Leg day & mobility work',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '6:00 PM',
    priority: 'Important',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    user_id: 'guest',
    title: 'Apply for 2 SOC jobs',
    notes: 'Tailor CV for detection engineering',
    due_date: new Date().toISOString().split('T')[0],
    due_time: null,
    priority: 'Normal',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    user_id: 'guest',
    title: 'Work on SOC-AI',
    notes: 'Build phishing training parser',
    due_date: new Date().toISOString().split('T')[0],
    due_time: null,
    priority: 'Normal',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return DEFAULT_TASKS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
}

function saveLocalTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event('lifeos-tasks-updated'));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('completed', { ascending: true })
            .order('created_at', { ascending: false });

          if (!error && data) {
            return data as Task[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }
    return getLocalTasks();
  },

  async createTask(input: {
    title: string;
    notes?: string;
    due_date?: string;
    due_time?: string | null;
    priority?: Priority;
  }): Promise<Task> {
    const newTask: Task = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      user_id: 'guest',
      title: input.title,
      notes: input.notes || '',
      due_date: input.due_date || new Date().toISOString().split('T')[0],
      due_time: input.due_time || null,
      priority: input.priority || 'Normal',
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          newTask.user_id = user.id;
          const { data, error } = await supabase
            .from('tasks')
            .insert(newTask)
            .select()
            .single();

          if (!error && data) {
            window.dispatchEvent(new Event('lifeos-tasks-updated'));
            return data as Task;
          }
        }
      } catch (err) {
        console.warn('Supabase insert failed, storing locally:', err);
      }
    }

    const tasks = getLocalTasks();
    const updated = [newTask, ...tasks];
    saveLocalTasks(updated);
    return newTask;
  },

  async toggleTask(id: string): Promise<Task | null> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch existing
          const { data: existing } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single();

          if (existing) {
            const nextCompleted = !existing.completed;
            const { data, error } = await supabase
              .from('tasks')
              .update({
                completed: nextCompleted,
                completed_at: nextCompleted ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', id)
              .select()
              .single();

            if (!error && data) {
              window.dispatchEvent(new Event('lifeos-tasks-updated'));
              return data as Task;
            }
          }
        }
      } catch (err) {
        console.warn('Supabase toggle failed, toggling locally:', err);
      }
    }

    const tasks = getLocalTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const task = tasks[index];
    const nextCompleted = !task.completed;
    const updatedTask: Task = {
      ...task,
      completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    saveLocalTasks(tasks);
    return updatedTask;
  },

  async deleteTask(id: string): Promise<void> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('tasks').delete().eq('id', id);
          window.dispatchEvent(new Event('lifeos-tasks-updated'));
          return;
        }
      } catch (err) {
        console.warn('Supabase delete failed, deleting locally:', err);
      }
    }

    const tasks = getLocalTasks().filter((t) => t.id !== id);
    saveLocalTasks(tasks);
  },
};
