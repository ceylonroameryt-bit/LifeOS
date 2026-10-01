'use client';

import React, { useState, useEffect } from 'react';
import { InboxItem } from '@/types';
import { inboxService } from '@/lib/services/inboxService';
import { Inbox, CheckCircle2, Lightbulb, Heart, FileText, Trash2, Plus } from 'lucide-react';

export function InboxView() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [inputVal, setInputVal] = useState('');

  const loadItems = async () => {
    const data = await inboxService.getItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('lifeos-inbox-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-inbox-updated', handleUpdate);
  }, []);

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    await inboxService.createItem(inputVal.trim());
    setInputVal('');
    loadItems();
  };

  const handleConvertTask = async (id: string) => {
    await inboxService.convertToTask(id);
    loadItems();
  };

  const handleConvertIdea = async (id: string) => {
    await inboxService.convertToIdea(id);
    loadItems();
  };

  const handleConvertWishlist = async (id: string) => {
    await inboxService.convertToWishlist(id);
    loadItems();
  };

  const handleConvertNote = async (id: string) => {
    await inboxService.convertToNote(id);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    await inboxService.deleteItem(id);
    loadItems();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          Universal Inbox
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-primary">
            {items.length} unclassified
          </span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Zero friction raw capture. Triage into Tasks, Ideas, or Wishlist whenever ready.
        </p>
      </div>

      {/* Quick Raw Capture Bar */}
      <form onSubmit={handleQuickCapture} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Dump any thought, link, or note here in 1 second..."
          className="flex-1 px-4 py-3 bg-surface rounded-2xl border border-border/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          Capture
        </button>
      </form>

      {/* Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-surface rounded-3xl border border-border/80 p-12 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">
              Inbox Zero
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              All raw thoughts have been triaged into their respective life modules.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.content}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Captured {item.created_at}
                </span>
              </div>

              {/* Conversion Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleConvertTask(item.id)}
                  title="Convert to Task"
                  className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Task
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertIdea(item.id)}
                  title="Convert to Idea"
                  className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-idea hover:text-idea flex items-center gap-1 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-idea" /> Idea
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertWishlist(item.id)}
                  title="Convert to Wishlist"
                  className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-pink-500 hover:text-pink-500 flex items-center gap-1 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-pink-500" /> Wishlist
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertNote(item.id)}
                  title="Convert to Note"
                  className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-purple hover:text-purple flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-purple" /> Note
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-danger rounded-lg transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
