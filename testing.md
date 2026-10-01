> Historical product specification. See [README.md](README.md) for the current implementation, validation commands, deployment requirements, and limitations.

# LifeOS — Quality Assurance & Testing Strategy

---

## 1. Unit Testing Matrix

| Domain | Tested Functionality | Expected Invariant |
| :--- | :--- | :--- |
| **Finances** | `calculateBudgetProgress(expenses, budget)` | `spent + remaining == totalBudget` (unless over budget, where `remaining == 0` and `overBudget == spent - budget`). Exact decimal rounding to 2 places. |
| **Habits** | `calculateStreak(entries)` | Consecutive daily completions increment streak; a slip resets or holds avoid streaks appropriately. |
| **Habits** | `calculateWeeklyProgress(entries, target)` | Counts completions within current Monday–Sunday window. Format: `X/Y`. |
| **Wishlist** | `calculateHoursRemaining(createdAt, waitHours)` | Exact countdown: `max(0, waitHours - elapsedHours)`. Zero unlocks "Buy" action. |
| **Smart Capture** | `parseSmartInput(text)` | Deterministic regex extraction: "Tesco 14.50" -> Expense (£14.50, "Tesco"); "Gym tomorrow 6pm" -> Task ("Gym", date+1, 18:00); "Sony lens 450" -> Wishlist. |

---

## 2. Integration & End-to-End Test Matrix

1. **Task Lifecycle**:
   - Trigger Quick Add (`+` or `Cmd+K`).
   - Fill "New Task": Title "Apply for 2 SOC jobs", Priority "Important", Time "6:00 PM".
   - Click "Save Task".
   - Invariant: Appears in Today Tasks immediately.
   - Reload page: Task persists from local/Supabase storage.
   - Check checkbox: Stripped line-through styling, green checkmark, persisted state.

2. **Expense & Budget Lifecycle**:
   - Open Quick Add -> Expense.
   - Enter amount `14.50`, description `Tesco groceries`, category `Food`.
   - Save Expense.
   - Invariant: Money card updates immediately (£42 -> £27.50 left, spent increases).

3. **Habit Slip Logging**:
   - Open Habit card or Habits view.
   - On "No impulse buying", click "I slipped".
   - Select trigger "Saw something online".
   - Invariant: Slip is logged with timestamp and trigger; streak resets cleanly; observation appears in Insights.

---

## 3. Responsive Viewport Acceptance Tests

- **Mobile Viewport (`375px × 667px` and `390px × 844px`)**:
  - Bottom navigation bar visible and sticky with safe-area spacing.
  - Only `Today`, `+`, `Me` visible in bottom bar.
  - Money & Habits render as compact side-by-side tiles.
  - No horizontal scrolling (`overflow-x: hidden`).
  - Touch targets strictly ≥ 44px.

- **Tablet Viewport (`820px × 1180px`)**:
  - Left rail renders compact icons with active state styling.
  - Dashboard renders balanced two-column grid.

- **Desktop Viewport (`1440px × 900px`)**:
  - Left sidebar renders full logo, primary navigation, focus/agendas, settings, and user profile badge.
  - 12-column layout (7 columns execution, 5 columns telemetry).
  - `Cmd+K` keyboard shortcut instantly opens Quick Add.
