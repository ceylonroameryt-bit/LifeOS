import { InboxItem } from '@/types';
import { SEED_INBOX } from '@/lib/data/seedData';
import { taskService } from './taskService';
import { ideaService } from './ideaService';
import { wishlistService } from './wishlistService';
import { noteService } from './noteService';

const INBOX_STORAGE_KEY = 'lifeos_inbox_store';

function getLocalInbox(): InboxItem[] {
  if (typeof window === 'undefined') return SEED_INBOX;
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(SEED_INBOX));
      return SEED_INBOX;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_INBOX;
  }
}

function saveLocalInbox(items: InboxItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('lifeos-inbox-updated'));
  } catch (e) {
    console.error('Failed to save inbox:', e);
  }
}

export const inboxService = {
  async getItems(): Promise<InboxItem[]> {
    return getLocalInbox();
  },

  async createItem(content: string, suggested_type: string = 'Task'): Promise<InboxItem> {
    const newItem: InboxItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inbox-${Date.now()}`,
      user_id: 'guest',
      content: content.trim(),
      suggested_type,
      status: 'inbox',
      created_at: 'Just now',
    };

    const current = getLocalInbox();
    const updated = [newItem, ...current];
    saveLocalInbox(updated);
    return newItem;
  },

  async convertToTask(id: string): Promise<void> {
    const items = getLocalInbox();
    const target = items.find((i) => i.id === id);
    if (!target) return;
    await taskService.createTask({ title: target.content, priority: 'Normal' });
    await this.deleteItem(id);
  },

  async convertToIdea(id: string): Promise<void> {
    const items = getLocalInbox();
    const target = items.find((i) => i.id === id);
    if (!target) return;
    await ideaService.createIdea({ title: target.content });
    await this.deleteItem(id);
  },

  async convertToWishlist(id: string): Promise<void> {
    const items = getLocalInbox();
    const target = items.find((i) => i.id === id);
    if (!target) return;
    await wishlistService.createItem({ title: target.content, price: 50 });
    await this.deleteItem(id);
  },

  async convertToNote(id: string): Promise<void> {
    const items = getLocalInbox();
    const target = items.find((i) => i.id === id);
    if (!target) return;
    await noteService.createNote({ title: target.content.slice(0, 30), body: target.content });
    await this.deleteItem(id);
  },

  async deleteItem(id: string): Promise<void> {
    const items = getLocalInbox();
    const updated = items.filter((i) => i.id !== id);
    saveLocalInbox(updated);
  },
};
