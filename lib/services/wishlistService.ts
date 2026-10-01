import { WishlistItem } from '@/types';
import { SEED_WISHLIST } from '@/lib/data/seedData';

const WISHLIST_STORAGE_KEY = 'lifeos_wishlist_store';

function getLocalWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return SEED_WISHLIST;
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(SEED_WISHLIST));
      return SEED_WISHLIST;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_WISHLIST;
  }
}

function saveLocalWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('lifeos-wishlist-updated'));
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const items = getLocalWishlist();
    // Update live remaining hours based on current time
    const now = Date.now();
    return items.map((item) => {
      const targetTime = new Date(item.available_after).getTime();
      const diffMs = targetTime - now;
      const hoursRemaining = Math.max(0, diffMs / (1000 * 60 * 60));
      return {
        ...item,
        hours_remaining: hoursRemaining,
        status: hoursRemaining === 0 && item.status === 'Waiting' ? 'Approved' : item.status,
      };
    });
  },

  async createItem(input: {
    title: string;
    price: number;
    url?: string;
    notes?: string;
    wait_hours?: number;
  }): Promise<WishlistItem> {
    const waitHours = input.wait_hours || 48;
    const now = new Date();
    const availableAfter = new Date(now.getTime() + waitHours * 3600 * 1000).toISOString();

    const newItem: WishlistItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `wish-${Date.now()}`,
      user_id: 'guest',
      title: input.title,
      price: input.price,
      url: input.url,
      notes: input.notes,
      wait_duration_hours: waitHours,
      hours_remaining: waitHours,
      available_after: availableAfter,
      status: 'Waiting',
      created_at: now.toISOString(),
    };

    const current = getLocalWishlist();
    const updated = [newItem, ...current];
    saveLocalWishlist(updated);
    return newItem;
  },

  async updateStatus(id: string, status: WishlistItem['status']): Promise<void> {
    const current = getLocalWishlist();
    const updated = current.map((w) => (w.id === id ? { ...w, status } : w));
    saveLocalWishlist(updated);
  },

  async deleteItem(id: string): Promise<void> {
    const current = getLocalWishlist();
    const updated = current.filter((w) => w.id !== id);
    saveLocalWishlist(updated);
  },
};
