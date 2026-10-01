# LifeOS — Route Architecture & Navigation Map

LifeOS supports two navigation paradigms:
1. **Dynamic Tab AppShell** (Seamless single-page transitions without full page reloads, preserving offline state and timer contexts).
2. **Deep-Linkable URL Routes** (Direct linking to any life module for desktop bookmarks, browser history, and PWA shortcuts).

---

## 1. Application Routes

| Route | Module | Purpose & Features |
| :--- | :--- | :--- |
| `/` | **Today** | The command centre. Hero greeting, Today tasks, Money preview, Habits preview, Upcoming deadlines, Career snapshot, Ideas spark. |
| `/tasks` | **Tasks** | Comprehensive task manager. Filter by Open / Completed / Archived / Priority. Recurrence rules and due times. |
| `/money` | **Money & Budget** | Financial pulse. Weekly/Monthly budget progress, category spend breakdown, expense logging, income, subscriptions, and savings goals. |
| `/habits` | **Habits** | Dual-mode habit engine. Positive "Build" habits (M-S progress dots) and "Avoid" habits (streak counter, slip trigger modal). |
| `/career` | **Career & Jobs** | Job hunt command center. Application pipeline (Saved/Applied/Interview/Offer), interview stages, follow-up alerts, recruiter contact book, and CV version registry. |
| `/ideas` | **Ideas** | Thought vault. Categorized ideas, search, quick capture, status pipeline, and one-click "Convert to Task". |
| `/goals` | **Goals** | Life milestones across Career, Money, and Personal domains. Visual progress percentages and next immediate actions. |
| `/wishlist` | **Wishlist & Wait** | Impulse-buying defence system. 48-hour mandatory wait countdown timers. Actions: "Buy", "Keep Waiting", "I Don't Need It". |
| `/admin` | **Life Admin** | Contract and renewal countdowns (Car insurance, passports, visas, MOT, subscriptions) with day-remaining badges. |
| `/calendar` | **Calendar** | Unified schedule aggregating tasks, interview meetings, admin deadlines, and subscription renewal dates. |
| `/inbox` | **Universal Inbox** | Unsorted quick captures and low-confidence smart entries awaiting triage into Tasks, Ideas, Wishlist, or Jobs. |
| `/focus` | **Focus Mode** | Apple-style zen Pomodoro timer (25 min default), calm dark visual canvas, task pinning, and completion logging. |
| `/insights` | **Insights & Profiling** | Data-driven observations on productivity, budget discipline, habit consistency, and slip triggers. Strictly factual. |
| `/weekly-review` | **Weekly Review** | Structured retrospective: Tasks completed, budget outcome, habit score, and selection of Top 3 Priorities for next week. |
| `/settings` | **Settings & Me** | Profile customization, avatar upload, currency, timezone, appearance (System / Light / Dark), notification controls, and data export. |

---

## 2. API Routes (Server-Side Only)

| Endpoint | Method | Role |
| :--- | :--- | :--- |
| `/api/ai/assistant` | `POST` | Server-side execution of optional AI actions (Job analysis, interview prep, weekly review summary) with zero client API key exposure. |
| `/api/sync/queue` | `POST` | Batch transaction sync endpoint for offline queue resolution. |
| `/api/notifications` | `POST` | Web push subscription registration and reminder dispatch. |

---

## 3. Responsive Navigation Controls

- **Desktop (≥ 1200px)**: Persistent left sidebar containing all 12 modules, section dividers, "Add New" button, and user status badge.
- **Tablet (768px – 1199px)**: Compact left icon rail displaying icon badges with tooltips and active state pills.
- **Mobile (< 768px)**: Streamlined bottom bar with `Today` | `+` (Quick Add) | `Me`. All deep modules are accessible from summary cards or the Me directory.
