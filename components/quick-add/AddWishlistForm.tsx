'use client';

import React, { useState } from 'react';
import { wishlistService } from '@/lib/services/wishlistService';

interface AddWishlistFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddWishlistForm({ onClose, onSuccess, initialTitle = '' }: AddWishlistFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [waitHours, setWaitHours] = useState(48);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const numPrice = parseFloat(price);
    if (!title.trim() || isNaN(numPrice) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await wishlistService.createItem({
        title: title.trim(),
        price: numPrice,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        wait_hours: waitHours,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create wishlist item:', err);
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
          Wait Before Buying
        </h2>

        <button
          type="submit"
          disabled={!title.trim() || !price.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Start Wait'}
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
            placeholder="Item Name (e.g. Sony Lens)"
            className="w-full text-base pb-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <div className="flex items-center gap-2 pt-3">
            <span className="text-base font-bold text-slate-500">£</span>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450.00"
              className="w-full text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-semibold"
            />
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 px-4 py-3 shadow-2xs divide-y divide-border/60">
          <div className="flex items-center justify-between text-sm py-2">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Cooling-off Period
            </span>
            <select
              value={waitHours}
              onChange={(e) => setWaitHours(parseInt(e.target.value))}
              className="text-xs font-semibold text-primary bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours (recommended)</option>
              <option value={72}>72 hours</option>
              <option value={168}>7 days</option>
            </select>
          </div>

          <div className="py-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Store or product link (optional)"
              className="w-full text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
