"use client";

import React, { useState } from "react";
import { HabitType } from "@/types";
import { habitService } from "@/lib/services/habitService";
import { cn } from "@/lib/utils";

interface AddHabitFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddHabitForm({
  onClose,
  onSuccess,
  initialTitle = "",
}: AddHabitFormProps) {
  const [name, setName] = useState(initialTitle);
  const [error, setError] = useState("");
  const [type, setType] = useState<HabitType>("positive");
  const [target, setTarget] = useState("5 days / week");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      await habitService.createHabit({
        name: name.trim(),
        type,
        target: type === "positive" ? target : "Every day",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Save failed. Please retry.",
      );
      console.error("Failed to create habit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-card w-full">
      {error && (
        <p role="alert" className="px-6 py-2 text-sm text-danger">
          {error}
        </p>
      )}
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
          New Habit
        </h2>

        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? "Saving..." : "Save Habit"}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 bg-background dark:bg-background/80 flex-1 overflow-y-auto">
        {/* Habit Type Segmented Control */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            HABIT TYPE
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType("positive");
                setTarget("5 days / week");
              }}
              className={cn(
                "py-2 text-xs font-semibold rounded-lg transition-all",
                type === "positive"
                  ? "bg-surface text-success shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              Build Habit
            </button>
            <button
              type="button"
              onClick={() => {
                setType("avoid");
                setTarget("Every day");
              }}
              className={cn(
                "py-2 text-xs font-semibold rounded-lg transition-all",
                type === "avoid"
                  ? "bg-surface text-danger shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              Avoid Habit
            </button>
          </div>
        </div>

        {/* Habit Name */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "positive"
                ? "e.g. Gym, Reading, Sleep before 12"
                : "e.g. No impulse buying"
            }
            className="w-full text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
          />
        </div>

        {/* Target Frequency for positive habits */}
        {type === "positive" && (
          <div className="bg-surface rounded-2xl border border-border/80 px-4 py-3 shadow-2xs">
            <div className="flex items-center justify-between text-sm py-1">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Weekly Target
              </span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="text-xs font-semibold text-primary bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="3 days / week">3 days / week</option>
                <option value="4 days / week">4 days / week</option>
                <option value="5 days / week">5 days / week</option>
                <option value="6 days / week">6 days / week</option>
                <option value="7 days / week">Every day (7 days)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
