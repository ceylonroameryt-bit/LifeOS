'use client';

import React, { useState, useEffect } from 'react';
import { AdminItem, AdminCategory } from '@/types';
import { adminService } from '@/lib/services/adminService';
import { Shield, Calendar, Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminView() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AdminCategory>('Insurance');
  const [newDate, setNewDate] = useState('');
  const [newCost, setNewCost] = useState('');

  const loadItems = async () => {
    const data = await adminService.getAdminItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('lifeos-admin-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-admin-updated', handleUpdate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    await adminService.createItem({
      title: newTitle.trim(),
      category: newCategory,
      due_date: newDate,
      cost: newCost.trim() || undefined,
    });
    setNewTitle('');
    setNewCost('');
    setShowAdd(false);
    loadItems();
  };

  const handleToggle = async (id: string) => {
    await adminService.toggleStatus(id);
    loadItems();
  };

  const categories = [
    'All',
    'Insurance',
    'Vehicle',
    'Documents',
    'Bills',
    'Subscriptions',
    'Visa / permits',
  ];

  const filtered = items.filter(
    (i) => selectedCategory === 'All' || i.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Life Admin & Renewals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Never miss a renewal, vehicle test, passport deadline, or contract expiry
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Item
        </button>
      </div>

      {/* Add Admin Form */}
      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-4 animate-in fade-in"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            New Admin Contract / Deadline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title (e.g. MOT inspection, Car insurance)"
              className="text-xs px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as AdminCategory)}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="Insurance">Insurance</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Documents">Documents</option>
              <option value="Bills">Bills</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Visa / permits">Visa / permits</option>
              <option value="Appointments">Appointments</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="text-xs px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <input
              type="text"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
              placeholder="Estimated cost (e.g. £420/yr)"
              className="text-xs px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs"
            >
              Save Admin Item
            </button>
          </div>
        </form>
      )}

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              selectedCategory === cat
                ? 'bg-primary text-white shadow-2xs font-bold'
                : 'bg-surface border border-border/80 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Admin Rows */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {item.title}
                  {item.cost && (
                    <span className="text-xs font-semibold text-primary">{item.cost}</span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.category} • Due {item.due_date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap',
                  item.days_remaining <= 7
                    ? 'bg-rose-50 text-danger dark:bg-rose-950/60'
                    : item.days_remaining <= 30
                    ? 'bg-amber-50 text-idea dark:bg-amber-950/60'
                    : 'bg-blue-50 text-primary dark:bg-blue-950/60'
                )}
              >
                {item.days_remaining} days
              </span>

              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  item.status === 'completed'
                    ? 'bg-emerald-50 text-success border-emerald-200'
                    : 'text-slate-400 hover:text-slate-600 border-border'
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
