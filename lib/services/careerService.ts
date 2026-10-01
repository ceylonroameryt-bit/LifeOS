import { CareerJob, Interview, JobFollowup, Recruiter, CVVersion } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  SEED_CAREER,
  SEED_INTERVIEWS,
  SEED_FOLLOWUPS,
  SEED_RECRUITERS,
  SEED_CV_VERSIONS,
} from '@/lib/data/seedData';

const JOBS_STORAGE_KEY = 'lifeos_career_jobs_store';
const INTERVIEWS_STORAGE_KEY = 'lifeos_interviews_store';
const FOLLOWUPS_STORAGE_KEY = 'lifeos_followups_store';

function getLocal<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function saveLocal<T>(key: string, data: T[], eventName: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event(eventName));
  } catch (e) {
    console.error(`Failed to save ${key} locally:`, e);
  }
}

export const careerService = {
  async getJobs(): Promise<CareerJob[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('applied_at', { ascending: false });
          if (!error && data && data.length > 0) {
            return data.map((d) => ({
              ...d,
              title: d.job_title || d.title,
              applied_date: d.applied_at || d.applied_date,
            })) as CareerJob[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }
    return getLocal<CareerJob>(JOBS_STORAGE_KEY, SEED_CAREER);
  },

  async createJob(input: Partial<CareerJob> & { title: string; company: string }): Promise<CareerJob> {
    const newJob: CareerJob = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `job-${Date.now()}`,
      user_id: 'guest',
      title: input.title,
      company: input.company,
      location: input.location || 'Remote',
      work_style: input.work_style || 'Hybrid',
      salary: input.salary,
      job_url: input.job_url,
      applied_date: input.applied_date || new Date().toISOString().split('T')[0],
      status: input.status || 'Applied',
      next_action: input.next_action || 'Follow up with recruiter',
      recruiter: input.recruiter,
      cv_version: input.cv_version || 'SOC CV v12',
      notes: input.notes,
    };

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          newJob.user_id = user.id;
          const { data, error } = await supabase
            .from('jobs')
            .insert({
              id: newJob.id,
              user_id: user.id,
              job_title: newJob.title,
              company: newJob.company,
              location: newJob.location,
              work_style: newJob.work_style,
              job_url: newJob.job_url,
              status: newJob.status,
              applied_at: newJob.applied_date,
              next_action: newJob.next_action,
              notes: newJob.notes,
            })
            .select()
            .single();

          if (!error && data) {
            window.dispatchEvent(new Event('lifeos-career-updated'));
            return newJob;
          }
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving locally:', err);
      }
    }

    const current = getLocal<CareerJob>(JOBS_STORAGE_KEY, SEED_CAREER);
    const updated = [newJob, ...current];
    saveLocal(JOBS_STORAGE_KEY, updated, 'lifeos-career-updated');
    return newJob;
  },

  async updateJobStatus(id: string, status: CareerJob['status']): Promise<void> {
    const current = getLocal<CareerJob>(JOBS_STORAGE_KEY, SEED_CAREER);
    const updated = current.map((j) => (j.id === id ? { ...j, status } : j));
    saveLocal(JOBS_STORAGE_KEY, updated, 'lifeos-career-updated');
  },

  async getInterviews(): Promise<Interview[]> {
    return getLocal<Interview>(INTERVIEWS_STORAGE_KEY, SEED_INTERVIEWS);
  },

  async getFollowups(): Promise<JobFollowup[]> {
    return getLocal<JobFollowup>(FOLLOWUPS_STORAGE_KEY, SEED_FOLLOWUPS);
  },

  async completeFollowup(id: string): Promise<void> {
    const current = getLocal<JobFollowup>(FOLLOWUPS_STORAGE_KEY, SEED_FOLLOWUPS);
    const updated = current.map((f) => (f.id === id ? { ...f, status: 'completed' as const } : f));
    saveLocal(FOLLOWUPS_STORAGE_KEY, updated, 'lifeos-career-updated');
  },

  async getRecruiters(): Promise<Recruiter[]> {
    return SEED_RECRUITERS;
  },

  async getCVVersions(): Promise<CVVersion[]> {
    return SEED_CV_VERSIONS;
  },
};
