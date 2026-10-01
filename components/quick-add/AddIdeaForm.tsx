'use client';

import React, { useState } from 'react';
import { ideaService } from '@/lib/services/ideaService';

interface AddIdeaFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddIdeaForm({ onClose, onSuccess, initialTitle = '' }: AddIdeaFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Cybersecurity');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await ideaService.createIdea({
        title: title.trim(),
        content: content.trim(),
        category,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create idea:', err);
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
          Capture Idea
        </h2>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Idea'}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 bg-background dark:bg-background/80 flex-1 overflow-y-auto">
        {/* Title & Notes */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs divide-y divide-border/60">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Idea title (e.g. Build phishing training tool)"
            className="w-full text-base pb-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Details, sparks, links, or notes..."
            className="w-full text-sm pt-3 bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none resize-none"
          />
        </div>

        {/* Category Picker */}
        <div className="bg-surface rounded-2xl border border-border/80 px-4 py-3 shadow-2xs">
          <div className="flex items-center justify-between text-sm py-1">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs font-semibold text-primary bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Creative">Creative</option>
              <option value="Media">Media</option>
              <option value="Product">Product</option>
              <option value="Life">Life</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
