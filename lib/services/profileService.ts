import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';

const PROFILE_STORAGE_KEY = 'lifeos_profile_store';

const DEFAULT_PROFILE: Profile = {
  id: 'guest',
  name: 'Poorna',
  email: 'poorna@lifeos.local',
  currency: 'GBP',
  timezone: 'Europe/London',
  budget_period: 'weekly',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const profileService = {
  async getProfile(): Promise<Profile> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            return data as Profile;
          }
        }
      } catch (err) {
        console.warn('Supabase profile fetch error, fallback to local:', err);
      }
    }

    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_PROFILE;
  },

  async updateName(name: string): Promise<Profile> {
    const current = await this.getProfile();
    const updated: Profile = { ...current, name, updated_at: new Date().toISOString() };

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ name }).eq('id', user.id);
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('lifeos-profile-updated'));
    }
    return updated;
  },
};
