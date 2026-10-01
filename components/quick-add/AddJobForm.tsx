'use client';

import React, { useState } from 'react';
import { WorkStyle, JobStatus, CareerJob } from '@/types';
import { careerService } from '@/lib/services/careerService';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';

interface AddJobFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddJobForm({ onClose, onSuccess, initialTitle = '' }: AddJobFormProps) {
  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState(initialTitle);
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('');
  const [workStyle, setWorkStyle] = useState<WorkStyle>('Hybrid');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<JobStatus>('Applied');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobTitle.trim() || !company.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await careerService.createJob({
        title: jobTitle.trim(),
        company: company.trim(),
        location: location.trim() || 'Remote',
        work_style: workStyle,
        salary: salary.trim() || undefined,
        job_url: jobUrl.trim() || undefined,
        applied_date: appliedDate,
        status,
        next_action: status === 'Applied' ? 'Follow up in 5 days' : undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create job:', err);
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
          Add Job
        </h2>

        <button
          type="submit"
          disabled={!jobTitle.trim() || !company.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Job'}
        </button>
      </div>

      {/* Body with soft white rounded cards on cool grey canvas */}
      <div className="p-5 space-y-4 bg-background dark:bg-background/80 flex-1 overflow-y-auto max-h-[75vh]">
        {/* Paste Job Link */}
        <div className="bg-surface rounded-2xl border border-border/80 p-3.5 shadow-2xs flex items-center gap-2.5">
          <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="Paste Job Link"
            className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Job Title & Company */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs divide-y divide-border/60">
          <input
            type="text"
            required
            autoFocus
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job Title (e.g. SOC Analyst)"
            className="w-full text-base pb-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-semibold"
          />
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (e.g. ABC Security)"
            className="w-full text-sm pt-3 bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Location & Salary */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs divide-y divide-border/60">
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Location
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. London / Remote"
              className="text-sm text-right bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
            />
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Salary
            </span>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. £40k – £45k"
              className="text-sm text-right bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Work Style Segmented Control */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            WORK STYLE
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            {(['Remote', 'Hybrid', 'Office'] as WorkStyle[]).map((ws) => (
              <button
                key={ws}
                type="button"
                onClick={() => setWorkStyle(ws)}
                className={cn(
                  'py-2 text-xs font-semibold rounded-lg transition-all',
                  workStyle === ws
                    ? 'bg-surface text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {ws}
              </button>
            ))}
          </div>
        </div>

        {/* Applied Date & Status */}
        <div className="bg-surface rounded-2xl border border-border/80 px-4 py-3 shadow-2xs divide-y divide-border/60">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Applied Date
            </span>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="text-xs font-semibold text-primary bg-transparent focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="text-xs font-semibold text-primary bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
