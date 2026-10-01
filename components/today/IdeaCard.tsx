"use client";

import React from "react";
import { useData } from "@/lib/useData";
import { ideaService } from "@/lib/services/ideaService";
const loadIdeas = () => ideaService.getIdeas();
import { LifeCard } from "@/components/ui/LifeCard";
import { Lightbulb, ChevronRight } from "lucide-react";

interface IdeaCardProps {
  onClick?: () => void;
}

export function IdeaCard({ onClick }: IdeaCardProps) {
  const ideas = useData(loadIdeas, [], "lifeos-ideas-updated");

  return (
    <LifeCard
      onClick={onClick}
      className="p-5 flex flex-col justify-between cursor-pointer hover:border-idea/40 transition-all select-none group"
    >
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-idea" />
            IDEAS
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400">
            recent
          </span>
        </div>

        <div className="space-y-2">
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 text-sm"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                💡 {idea.title}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {new Date(idea.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Idea Vault</span>
        <span className="inline-flex items-center text-primary group-hover:translate-x-0.5 transition-transform font-semibold">
          Ideas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
