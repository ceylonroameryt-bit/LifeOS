"use client";

import React, { useState } from "react";
import { moneyService } from "@/lib/services/moneyService";
import {
  X,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  Receipt,
  RefreshCw,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddExpenseFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialDescription?: string;
}

export function AddExpenseForm({
  onClose,
  onSuccess,
  initialDescription = "",
}: AddExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { name: "Food", icon: Utensils },
    { name: "Shopping", icon: ShoppingBag },
    { name: "Transport", icon: Car },
    { name: "Entertainment", icon: Film },
    { name: "Bills", icon: Receipt },
    { name: "Subscriptions", icon: RefreshCw },
    { name: "Other", icon: Tag },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    setError("");
    setIsSubmitting(true);
    try {
      await moneyService.addExpense({
        amount: parsedAmount,
        description: description.trim(),
        category,
        expense_date: date,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Save failed. Please retry.",
      );
      console.error("Failed to save expense:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {error && (
        <p role="alert" className="px-6 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          New Expense
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Amount
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-2xl font-bold text-slate-400">
              £
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-extrabold pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Description
          </label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Tesco, Pret, TfL..."
            className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Category Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all text-left",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-primary border-primary/50 shadow-2xs font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border/80 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!amount || !description.trim() || isSubmitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
        >
          {isSubmitting ? "Saving..." : "Save Expense"}
        </button>
      </div>
    </form>
  );
}
