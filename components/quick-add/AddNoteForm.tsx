'use client';

import React, { useState } from 'react';
import { noteService } from '@/lib/services/noteService';

interface AddNoteFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddNoteForm({ onClose, onSuccess, initialTitle = '' }: AddNoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await noteService.createNote({
        title: title.trim(),
        body: body.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-card w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
        <button
          type="button"
          onClick={onClose}
          className="text-primary font-medium text-base hover:opacity-80 transition-opacity"
        >
          Cancel
        </button>

        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          New Note
        </h2>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 bg-background dark:bg-background/80 flex-1 overflow-y-auto">
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs divide-y divide-border/60">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full text-base pb-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write notes, snippets, ideas..."
            className="w-full text-sm pt-3 bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none resize-none"
          />
        </div>
      </div>
    </form>
  );
}
