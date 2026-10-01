'use client';

import React, { useState, useEffect } from 'react';
import { CareerJob, JobStatus } from '@/types';
import { careerService } from '@/lib/services/careerService';
import { AddJobForm } from '@/components/quick-add/AddJobForm';
import {
  Briefcase,
  ExternalLink,
  Plus,
  Clock,
  Calendar,
  User,
  FileCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CareerView() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Applied' | 'Interview' | 'Waiting'>('All');
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);

  const loadJobs = async () => {
    const data = await careerService.getJobs();
    setJobs(data);
  };

  useEffect(() => {
    loadJobs();
    const handleUpdate = () => loadJobs();
    window.addEventListener('lifeos-career-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-career-updated', handleUpdate);
  }, []);

  const handleUpdateStatus = async (jobId: string, status: JobStatus) => {
    await careerService.updateJobStatus(jobId, status);
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, status });
    }
    loadJobs();
  };

  const applicationsCount = jobs.length;
  const interviewCount = jobs.filter((j) => j.status === 'Interview').length;
  const waitingCount = jobs.filter((j) => j.status === 'Applied' || j.status === 'Screening').length;

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Interview') return job.status === 'Interview';
    if (activeTab === 'Applied') return job.status === 'Applied';
    if (activeTab === 'Waiting') return job.status === 'Applied' || job.status === 'Screening';
    return true;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Career & Jobs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Applications, interview stages, and recruiter relationships
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddJob(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Job
        </button>
      </div>

      {/* Summary KPI Cards (Section 30 of specifications) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Applications
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">
            {applicationsCount}
          </span>
          <span className="text-[11px] text-slate-400">Total submitted</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Waiting
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">
            {waitingCount}
          </span>
          <span className="text-[11px] text-slate-400">Under review</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Interviews
          </span>
          <span className="text-2xl font-extrabold text-primary mt-1 block">
            {interviewCount}
          </span>
          <span className="text-[11px] text-primary/80 font-medium">Tomorrow: ABC Security</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Follow-ups Due
          </span>
          <span className="text-2xl font-extrabold text-amber-500 mt-1 block">
            1
          </span>
          <span className="text-[11px] text-slate-400">XYZ Ltd (Applied 6d ago)</span>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-border/60 self-start sm:self-auto w-fit">
        {(['All', 'Applied', 'Interview', 'Waiting'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all',
              activeTab === tab
                ? 'bg-surface text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Job Rows (Section 33 of specifications) */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs hover:border-primary/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                <Briefcase className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  {job.title}
                  <span className="text-xs font-normal text-slate-400">at {job.company}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {job.location} • {job.work_style} {job.salary ? `• ${job.salary}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {job.next_action && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline-block">
                  {job.next_action}
                </span>
              )}
              <span
                className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  job.status === 'Interview'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-primary'
                    : job.status === 'Offer'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-success'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                )}
              >
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Job Detail Modal (Section 34 of specifications) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedJob(null)}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-card rounded-3xl p-6 shadow-float border border-border z-10 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                  {selectedJob.title}
                </h3>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  {selectedJob.company} • {selectedJob.location} ({selectedJob.work_style})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Segmented Picker */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-border/60">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-1">
                UPDATE STAGE
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'] as JobStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedJob.id, st)}
                      className={cn(
                        'py-1.5 text-xs font-semibold rounded-lg transition-all',
                        selectedJob.status === st
                          ? 'bg-surface text-primary shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Applied Date
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedJob.applied_date}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Recruiter
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedJob.recruiter || 'Jane Smith'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" /> CV Version
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedJob.cv_version || 'SOC CV v12'}
                  </span>
                </div>
              </div>

              {selectedJob.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border/60">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Notes & Prep
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedJob.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              {selectedJob.job_url ? (
                <a
                  href={selectedJob.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Job Link
                </a>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddJob(false)}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-float border border-border z-10 overflow-hidden">
            <AddJobForm
              onClose={() => setShowAddJob(false)}
              onSuccess={() => {
                setShowAddJob(false);
                loadJobs();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
