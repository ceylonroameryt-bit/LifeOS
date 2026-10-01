import { AdminItem, AdminCategory } from '@/types';
import { SEED_ADMIN_ITEMS } from '@/lib/data/seedData';

const ADMIN_STORAGE_KEY = 'lifeos_admin_store';

function getLocalAdmin(): AdminItem[] {
  if (typeof window === 'undefined') return SEED_ADMIN_ITEMS;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(SEED_ADMIN_ITEMS));
      return SEED_ADMIN_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ADMIN_ITEMS;
  }
}

function saveLocalAdmin(items: AdminItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('lifeos-admin-updated'));
  } catch (e) {
    console.error('Failed to save admin items:', e);
  }
}

export const adminService = {
  async getAdminItems(): Promise<AdminItem[]> {
    const items = getLocalAdmin();
    // Calculate live days remaining
    const now = new Date();
    return items.map((item) => {
      const due = new Date(item.due_date);
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return {
        ...item,
        days_remaining: Math.max(0, diffDays),
      };
    });
  },

  async createItem(input: {
    title: string;
    category: AdminCategory;
    due_date: string;
    cost?: string;
    notes?: string;
  }): Promise<AdminItem> {
    const due = new Date(input.due_date);
    const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 3600 * 24));

    const newItem: AdminItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `adm-${Date.now()}`,
      user_id: 'guest',
      title: input.title,
      category: input.category,
      due_date: input.due_date,
      cost: input.cost,
      days_remaining: Math.max(0, diffDays),
      notes: input.notes,
      status: 'active',
    };

    const current = getLocalAdmin();
    const updated = [newItem, ...current];
    saveLocalAdmin(updated);
    return newItem;
  },

  async toggleStatus(id: string): Promise<void> {
    const current = getLocalAdmin();
    const updated = current.map((item) =>
      item.id === id ? { ...item, status: item.status === 'active' ? ('completed' as const) : ('active' as const) } : item
    );
    saveLocalAdmin(updated);
  },

  async deleteItem(id: string): Promise<void> {
    const current = getLocalAdmin();
    const updated = current.filter((item) => item.id !== id);
    saveLocalAdmin(updated);
  },
};
