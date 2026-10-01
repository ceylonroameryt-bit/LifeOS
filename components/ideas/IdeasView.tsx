'use client';

import React, { useState, useEffect } from 'react';
import { Idea } from '@/types';
import { ideaService } from '@/lib/services/ideaService';
import { Lightbulb, Search, Plus, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IdeasView() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadIdeas = async () => {
    const data = await ideaService.getIdeas();
    setIdeas(data);
  };

  useEffect(() => {
    loadIdeas();
    const handleUpdate = () => loadIdeas();
    window.addEventListener('lifeos-ideas-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-ideas-updated', handleUpdate);
  }, []);

  const handleConvertToTask = async (id: string) => {
    await ideaService.convertToTask(id);
    setToastMessage('Converted idea to today task!');
    setTimeout(() => setToastMessage(null), 3000);
    loadIdeas();
  };

  const handleDelete = async (id: string) => {
    await ideaService.deleteIdea(id);
    loadIdeas();
  };

  const categories = ['All', 'Cybersecurity', 'Creative', 'Media', 'General'];

  const filtered = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      (idea.content && idea.content.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || idea.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ideas & Sparks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Capture thoughts in seconds and convert sparks into actionable tasks
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Search Bar & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-surface rounded-2xl border border-border/80 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas..."
            className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-idea shadow-2xs'
                  : 'bg-surface border border-border/80 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Idea Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((idea) => (
          <div
            key={idea.id}
            className="bg-surface rounded-2xl border border-border/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:border-idea/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-idea">
                  {idea.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {idea.created_at}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                {idea.title}
              </h3>
              {idea.content && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {idea.content}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  idea.status === 'Working On'
                    ? 'bg-blue-50 dark:bg-blue-950 text-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {idea.status}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConvertToTask(idea.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-primary hover:bg-blue-100 transition-colors"
                >
                  Convert to Task
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idea.id)}
                  className="p-1.5 text-slate-400 hover:text-danger rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
