import { Note } from '@/types';
import { SEED_NOTES } from '@/lib/data/seedData';

const NOTES_STORAGE_KEY = 'lifeos_notes_store';

function getLocalNotes(): Note[] {
  if (typeof window === 'undefined') return SEED_NOTES;
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(SEED_NOTES));
      return SEED_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_NOTES;
  }
}

function saveLocalNotes(notes: Note[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new Event('lifeos-notes-updated'));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

export const noteService = {
  async getNotes(): Promise<Note[]> {
    return getLocalNotes();
  },

  async createNote(input: { title: string; body: string }): Promise<Note> {
    const newNote: Note = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`,
      user_id: 'guest',
      title: input.title,
      body: input.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = getLocalNotes();
    const updated = [newNote, ...current];
    saveLocalNotes(updated);
    return newNote;
  },

  async deleteNote(id: string): Promise<void> {
    const current = getLocalNotes();
    const updated = current.filter((n) => n.id !== id);
    saveLocalNotes(updated);
  },
};
