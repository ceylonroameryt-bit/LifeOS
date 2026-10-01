"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import { Check, Clock, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start justify-between py-3.5 px-3 rounded-xl transition-all duration-200 select-none hover:bg-slate-50/70 dark:hover:bg-slate-800/40",
        isDeleting && "opacity-0 scale-95",
      )}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Circular Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none flex-shrink-0",
            task.completed
              ? "bg-emerald-500 border-emerald-500 text-white scale-100"
              : "border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-transparent",
          )}
        >
          <Check
            className={cn(
              "w-3.5 h-3.5 stroke-[3] transition-transform duration-200",
              task.completed ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          />
        </button>

        {/* Task Details */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[15px] font-medium transition-all duration-200 leading-snug break-words",
                task.completed
                  ? "text-slate-400 dark:text-slate-500 line-through"
                  : "text-slate-900 dark:text-slate-100",
              )}
            >
              {task.title}
            </span>

            {task.priority === "Important" && !task.completed && (
              <span
                className="inline-flex items-center text-amber-500 dark:text-amber-400 flex-shrink-0"
                title="Important"
              >
                <AlertCircle className="w-4 h-4 fill-amber-500/10 stroke-[2.2]" />
              </span>
            )}
          </div>

          {/* Time & Notes */}
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
            {task.due_time ? (
              <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {task.due_time}
              </span>
            ) : (
              <span>Today</span>
            )}

            {task.notes && (
              <span className="truncate max-w-[200px] text-slate-400">
                • {task.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete button (visible on hover or focus) */}
      <button
        type="button"
        onClick={handleDelete}
        title="Delete task"
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all duration-150 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
