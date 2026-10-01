'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FocusView() {
  const [duration, setDuration] = useState(25 * 60); // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusTask, setFocusTask] = useState('Work on SOC-AI parser');

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleSelectDuration = (mins: number) => {
    setIsRunning(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-8 px-4 animate-in fade-in duration-300">
      {/* Calm Zen Focus Container */}
      <div className="w-full max-w-md bg-slate-900 text-slate-100 rounded-3xl p-8 sm:p-10 shadow-float border border-slate-800 text-center space-y-7 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Task Selector */}
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Focus Session
          </span>
          <input
            type="text"
            value={focusTask}
            onChange={(e) => setFocusTask(e.target.value)}
            className="w-full text-center text-sm font-semibold bg-transparent border-b border-slate-700/60 pb-1 text-slate-200 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Circular Timer Display */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center z-10">
          {/* Progress Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-800"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-primary transition-all duration-300"
              strokeWidth="5"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-extrabold tracking-tight text-white">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">
              {isRunning ? 'Flow state active' : 'Ready to focus'}
            </span>
          </div>
        </div>

        {/* Duration Preset Chips */}
        <div className="flex items-center justify-center gap-2 relative z-10">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSelectDuration(m)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
                duration === m * 60
                  ? 'bg-primary text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              )}
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2 relative z-10">
          <button
            type="button"
            onClick={resetTimer}
            title="Reset Timer"
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Start Focus
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTimeLeft(0)}
            title="Complete Session"
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
