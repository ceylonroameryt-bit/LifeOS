> Historical product specification. See [README.md](README.md) for the current implementation, validation commands, deployment requirements, and limitations.

# LifeOS — System Architecture & Technical Specifications

> **Core Philosophy**: Open → Understand my day in 5 seconds → Add something in 3 seconds → Do what matters → Close.
> **Mobile Anchor**: Today + Me (minimalist, low cognitive load, device safe-area compliant).

---

## 1. System Overview

LifeOS is a personal operating system designed to manage everyday life without introducing mental clutter or administrative friction. It provides a cohesive, unified workspace across all life domains:
- **Daily Execution**: Today dashboard, focused tasks, quick capture.
- **Finances**: Decimal-safe budget tracking, categorization, subscriptions, and savings goals.
- **Habits**: Dual-mode habit tracking (Positive "Build" with weekly frequency and Avoid "Resist/Slipped" with trigger logging).
- **Career Management**: Job applications, interview stages, recruiter relationships, follow-up reminders, and CV versioning.
- **Life Admin & Calendar**: Contract renewals, passport/insurance countdowns, aggregated agenda.
- **Impulse Control**: 48-hour wait-before-buying wishlist countdown timer.
- **Focus & Insights**: Zen Pomodoro focus timer, data-driven behavioural insights, and weekly review.
- **Intelligent Assistant & PWA**: Offline-first storage, deterministic smart capture parser, and optional server-side AI.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | High-performance React framework with server rendering and optimized client hydration. |
| **Language** | TypeScript (Strict mode) | Type safety across all models, preventing runtime surprises and invalid data states. |
| **Styling** | Tailwind CSS | Utility-first styling configured with LifeOS design tokens, responsive breakpoints, and dark mode. |
| **Icons** | Lucide React | Clean, Apple-style iconography matching modern minimalist iOS/macOS design. |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Enterprise-grade relational DB with native Row Level Security (RLS) and Supabase Auth. |
| **Validation** | Zod | Runtime schema validation for forms, smart capture, API inputs, and database records. |
| **Dates & Times** | date-fns | Lightweight, immutable date manipulation with timezone awareness. |
| **Money Handling** | PostgreSQL `NUMERIC(12,2)` / Decimal arithmetic | Exact penny-level accuracy avoiding floating-point rounding bugs. |
| **PWA & Offline** | Web Manifest + Service Worker + LocalStorage / IndexedDB | Standalone home-screen installability, offline shell, and optimistic sync queue. |
| **AI Integration** | Server-side API Route | Zero client-side API key leakage; privacy-first prompt minimization. |

---

## 3. High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT PLATFORMS                             │
│       Mobile (<768px)   │   Tablet (768–1199px)   │   Desktop (≥1200px)  │
│      Bottom Nav (Today/+) │     Compact Rail      │     Full Sidebar     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
│  AppShell (Responsive Layout Engine, Global Cmd+K, Theme State, Toasts)  │
│  ├── Today Dashboard (Hero Greeting, Tasks, Money, Habits, Upcoming)     │
│  ├── Domain Views (Money, Habits, Career, Ideas, Goals, Wishlist, Admin) │
│  ├── Quick Add Sheet (8 Pastel Category Tiles + Smart Capture Bar)       │
│  └── Focus Mode (25-min Calm Zen Timer) & Search Everything Modal        │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LOGIC & CACHE                        │
│  Deterministic Smart Capture Parser (Regex + NLP Tokenizer)              │
│  Services: TaskService, MoneyService, HabitService, CareerService, etc.  │
│  Offline Queue & Sync Engine (Optimistic UI + Event Bus)                 │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                         ┌───────────┴───────────┐
                         ▼                       ▼
            ┌─────────────────────────┐ ┌───────────────────────────┐
            │   SUPABASE BACKEND      │ │   NEXT.JS API ROUTES      │
            │  - PostgreSQL Tables    │ │  - /api/ai/assistant      │
            │  - Row Level Security   │ │  - /api/sync/queue        │
            │  - Auth (OAuth/Email)   │ │  - /api/notifications     │
            │  - Storage (Avatars/CVs)│ └───────────────────────────┘
            └─────────────────────────┘
```

---

## 4. Responsive Viewport Strategy

1. **Mobile (< 768px)**:
   - Fixed top header with greeting / date / quick action.
   - Single-column scrolling feed with compact cards (Money & Habits displayed as clean side-by-side tiles).
   - Bottom navigation bar: `Today` (left) | `+` (floating circular cobalt button in center) | `Me` (right).
   - Touch targets strictly ≥ 44px with device safe-area insets (`env(safe-area-inset-bottom)`).

2. **Tablet (768px – 1199px)**:
   - Compact left icon rail (w-16) showing brand badge and icon navigation.
   - Balanced two-column dashboard grid.
   - Quick Add accessible via rail top button and keyboard shortcut.

3. **Desktop (≥ 1200px)**:
   - Elegant left sidebar (w-64) with full labels, category groupings (Core, Focus & Agendas, Account), and profile badge.
   - Multi-column dashboard grid (7-column primary execution stream, 5-column secondary telemetry & upcoming stream).
   - Global keyboard shortcuts (`Cmd+K` / `Ctrl+K` for Quick Add, `Esc` to dismiss).

---

## 5. Offline Sync & Resilience

1. **Local-First Optimistic UI**: All user creations, toggles, and status changes update memory and persistent storage immediately before network resolution.
2. **Sync Queue**: Actions taken while offline are serialized into an append-only transaction queue.
3. **Reconnection Handler**: When `navigator.onLine` fires, the queue processes pending requests with conflict resolution favoring the latest local user intent.
