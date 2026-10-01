"use client";

import React from "react";
import { careerService } from "@/lib/services/careerService";
import { useData } from "@/lib/useData";
const loadCareer = () => careerService.getJobs();
import { LifeCard } from "@/components/ui/LifeCard";
import { Briefcase, Clock, ChevronRight } from "lucide-react";

interface CareerCardProps {
  onClick?: () => void;
}

export function CareerCard({ onClick }: CareerCardProps) {
  const jobs = useData(loadCareer, [], "lifeos-career-updated");
  return (
    <LifeCard
      onClick={onClick}
      className="p-5 flex flex-col justify-between cursor-pointer hover:border-primary/40 transition-all select-none group"
    >
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            CAREER
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-primary">
            {
              jobs.filter(
                (j) => !["Rejected", "Closed", "Withdrawn"].includes(j.status),
              ).length
            }{" "}
            active
          </span>
        </div>

        <div className="space-y-3">
          {jobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30"
            >
              <span className="text-xs text-primary">{job.status}</span>
              <p className="text-sm font-semibold">{job.company}</p>
              <p className="text-xs text-slate-500">
                {job.title} • {job.next_action}
              </p>
            </div>
          ))}
          {!jobs.length && (
            <p className="text-sm text-slate-500">No applications yet</p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Job Applications & Pipeline</span>
        <span className="inline-flex items-center text-primary group-hover:translate-x-0.5 transition-transform font-semibold">
          Career <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
