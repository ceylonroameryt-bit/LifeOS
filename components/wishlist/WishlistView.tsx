'use client';

import React, { useState, useEffect } from 'react';
import { WishlistItem } from '@/types';
import { wishlistService } from '@/lib/services/wishlistService';
import { Heart, Clock, ExternalLink, Check, Trash2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WishlistView() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const loadItems = async () => {
    const data = await wishlistService.getWishlist();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
    // Live update countdown every minute
    const interval = setInterval(loadItems, 60000);
    const handleUpdate = () => loadItems();
    window.addEventListener('lifeos-wishlist-updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('lifeos-wishlist-updated', handleUpdate);
    };
  }, []);

  const handleAction = async (id: string, status: WishlistItem['status']) => {
    if (status === 'Removed') {
      await wishlistService.deleteItem(id);
    } else {
      await wishlistService.updateStatus(id, status);
    }
    loadItems();
  };

  const formatHours = (hours: number) => {
    if (hours <= 0) return 'Wait Complete';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m remaining`;
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Wishlist & Impulse Defense
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Mandatory 48-hour cooling-off timers before checkout
        </p>
      </div>

      {/* Impulse Protection Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            48-Hour Waiting Philosophy
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Most spontaneous impulse desires fade within 48 hours, saving hundreds in unplanned purchases.
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isComplete = item.hours_remaining <= 0 || item.status === 'Approved';

          return (
            <div
              key={item.id}
              className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-xl font-extrabold text-primary mt-0.5">
                      £{item.price.toFixed(2)}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5',
                      isComplete
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-success'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-idea'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {formatHours(item.hours_remaining)}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(item.id, 'Removed')}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  I Don&apos;t Need It
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(item.id, 'Waiting')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Keep Waiting
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(item.id, 'Bought')}
                    className={cn(
                      'px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-xs',
                      isComplete
                        ? 'bg-success hover:bg-emerald-600'
                        : 'bg-primary hover:bg-primary-hover opacity-90'
                    )}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
