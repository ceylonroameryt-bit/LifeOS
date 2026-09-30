'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/types';
import { moneyService, DEFAULT_SUBSCRIPTIONS, DEFAULT_SAVINGS } from '@/lib/services/moneyService';
import { LifeCard } from '@/components/ui/LifeCard';
import { AddExpenseModal } from './AddExpenseModal';
import {
  CreditCard,
  Plus,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  Receipt,
  RefreshCw,
  Tag,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MoneyView() {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [budgetMode, setBudgetMode] = useState<'weekly' | 'monthly'>('weekly');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const list = await moneyService.getExpenses();
    setExpenses(list);
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('lifeos-expenses-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-expenses-updated', handleUpdate);
  }, [loadData]);

  const budget = moneyService.getBudget(budgetMode);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const roundedSpent = Math.round(totalSpent * 100) / 100;
  const remaining = Math.round((budget - roundedSpent) * 100) / 100;
  const isOverspent = remaining < 0;
  const percentage = Math.min(Math.round((roundedSpent / budget) * 100), 100);

  const categories = moneyService.getCategoryBreakdown(expenses);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Food': return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'Transport': return <Car className="w-4 h-4 text-cyan-500" />;
      case 'Entertainment': return <Film className="w-4 h-4 text-purple-500" />;
      case 'Bills': return <Receipt className="w-4 h-4 text-rose-500" />;
      case 'Subscriptions': return <RefreshCw className="w-4 h-4 text-emerald-500" />;
      default: return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Money
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Spending & simple budgeting
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl self-start sm:self-auto">
          {(['week', 'month', 'all'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPeriod(tab)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all',
                period === tab
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {tab === 'week' ? 'This Week' : tab === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Budget Card */}
      <LifeCard className="p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {budgetMode.toUpperCase()} BUDGET
              </span>
              <button
                type="button"
                onClick={() => setBudgetMode(budgetMode === 'weekly' ? 'monthly' : 'weekly')}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                (Switch to {budgetMode === 'weekly' ? 'Monthly' : 'Weekly'})
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                £{Math.abs(remaining).toFixed(0)}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  isOverspent
                    ? 'text-danger dark:text-danger'
                    : 'text-success dark:text-success'
                )}
              >
                {isOverspent ? 'over budget' : 'left'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              £{roundedSpent.toFixed(0)} spent of £{budget} {budgetMode === 'weekly' ? 'this week' : 'this month'} • {percentage}% spent
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-xs active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-500',
              isOverspent ? 'bg-danger' : percentage > 85 ? 'bg-warning' : 'bg-success'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </LifeCard>

      {/* Spending Breakdown by Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            SPENDING BY CATEGORY
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {categories.length} categories
          </span>
        </div>

        <LifeCard className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0 overflow-hidden">
          {categories.map((cat) => {
            const isExpanded = expandedCategory === cat.category;
            const categoryExpenses = expenses.filter((e) => e.category === cat.category);

            return (
              <div key={cat.category} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-left transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {cat.category}
                      </p>
                      <p className="text-xs text-slate-400">
                        {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      £{cat.total.toFixed(2)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded individual transactions list */}
                {isExpanded && (
                  <div className="bg-slate-50/60 dark:bg-slate-900/40 px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                    {categoryExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {exp.description}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          £{exp.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </LifeCard>
      </div>

      {/* 2-Column Subscriptions & Savings Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Subscriptions */}
        <LifeCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                SUBSCRIPTIONS
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                £69.99/mo
              </span>
            </div>

            <div className="space-y-2.5">
              {DEFAULT_SUBSCRIPTIONS.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {sub.name}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Renews {sub.renewal_date}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    £{sub.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </LifeCard>

        {/* Savings Goals */}
        <LifeCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              <span className="flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-success" />
                SAVINGS GOALS
              </span>
              <span className="text-xs text-slate-400">2 active</span>
            </div>

            <div className="space-y-3">
              {DEFAULT_SAVINGS.map((sav) => {
                const pct = Math.round((sav.current_amount / sav.target_amount) * 100);
                return (
                  <div key={sav.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {sav.title}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        £{sav.current_amount} / £{sav.target_amount} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-success h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </LifeCard>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
