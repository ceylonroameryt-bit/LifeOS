import { Idea } from '@/types';
import { SEED_IDEAS } from '@/lib/data/seedData';
import { taskService } from './taskService';

const IDEAS_STORAGE_KEY = 'lifeos_ideas_store';

function getLocalIdeas(): Idea[] {
  if (typeof window === 'undefined') return SEED_IDEAS;
  try {
    const raw = localStorage.getItem(IDEAS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(SEED_IDEAS));
      return SEED_IDEAS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_IDEAS;
  }
}

function saveLocalIdeas(ideas: Idea[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
    window.dispatchEvent(new Event('lifeos-ideas-updated'));
  } catch (e) {
    console.error('Failed to save ideas:', e);
  }
}

export const ideaService = {
  async getIdeas(): Promise<Idea[]> {
    return getLocalIdeas();
  },

  async createIdea(input: {
    title: string;
    content?: string;
    category?: string;
  }): Promise<Idea> {
    const newIdea: Idea = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idea-${Date.now()}`,
      user_id: 'guest',
      title: input.title,
      content: input.content || '',
      category: input.category || 'General',
      status: 'Saved',
      created_at: 'Today',
    };

    const current = getLocalIdeas();
    const updated = [newIdea, ...current];
    saveLocalIdeas(updated);
    return newIdea;
  },

  async updateStatus(id: string, status: Idea['status']): Promise<void> {
    const current = getLocalIdeas();
    const updated = current.map((i) => (i.id === id ? { ...i, status } : i));
    saveLocalIdeas(updated);
  },

  async deleteIdea(id: string): Promise<void> {
    const current = getLocalIdeas();
    const updated = current.filter((i) => i.id !== id);
    saveLocalIdeas(updated);
  },

  async convertToTask(id: string): Promise<void> {
    const current = getLocalIdeas();
    const idea = current.find((i) => i.id === id);
    if (!idea) return;

    // Create task
    await taskService.createTask({
      title: idea.title,
      notes: idea.content ? `From idea: ${idea.content}` : 'Converted from idea vault',
      priority: 'Normal',
    });

    // Mark idea as Working On
    await this.updateStatus(id, 'Working On');
  },
};
