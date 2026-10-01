"use client";

import React, { useState, useEffect } from "react";
import { Task, Priority } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { TaskRow } from "@/components/today/TaskRow";
import { CheckCircle2, Plus, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasksViewProps {
  onOpenQuickAdd: () => void;
}

export function TasksView({ onOpenQuickAdd }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    "all" | "open" | "completed" | "important"
  >("open");

  const loadTasks = async () => {
    const data = await taskService.getTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
    const handleUpdate = () => loadTasks();
    window.addEventListener("lifeos-tasks-updated", handleUpdate);
    return () =>
      window.removeEventListener("lifeos-tasks-updated", handleUpdate);
  }, []);

  const handleToggle = async (id: string) => {
    await taskService.toggleTask(id);
    await loadTasks();
  };

  const handleDelete = async (id: string) => {
    await taskService.deleteTask(id);
    await loadTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "open") return !t.completed;
    if (filter === "completed") return t.completed;
    if (filter === "important")
      return t.priority === "Important" && !t.completed;
    return true;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tasks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your single stream of priorities and daily execution
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-border/60 self-start sm:self-auto w-fit">
        {(["open", "all", "important", "completed"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all",
              filter === tab
                ? "bg-surface text-slate-900 dark:text-slate-100 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            {tab === "important" ? "Important Only" : tab}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium">No tasks in this view</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
