# LifeOS — Visual Specification & UI Design Tokens

Based directly on the approved LifeOS UI design reference and system standards.

---

## 1. Color Palette & Design Tokens

| Token Name | Hex Code | Dark Mode Counterpart | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#F6F8FC` | `#0B0F19` | Main page canvas background |
| **Card Surface** | `#FFFFFF` | `#131B2E` | Container cards, modals, sheets |
| **Primary Accent** | `#2F6BFF` | `#3B82F6` | Primary action buttons, active tabs, links |
| **Primary Soft** | `#EAF1FF` | `#1E293B` | Active tab highlights, badge backgrounds |
| **Text Primary** | `#111827` | `#F9FAFB` | Headings, primary titles, metrics |
| **Text Muted** | `#667085` | `#94A3B8` | Subtitles, timestamps, field labels |
| **Card Border** | `#E7ECF3` | `#1E293B` | Subtle 1px structural container borders |
| **Success Mint** | `#22B573` | `#10B981` | Completed checks, positive budget, streaks |
| **Success Soft** | `#E8F8F0` | `#064E3B` | Success pill backgrounds |
| **Warm Yellow / Idea** | `#E7A71A` | `#F59E0B` | Ideas, creative inspiration, warnings |
| **Yellow Soft** | `#FFF7DC` | `#78350F` | Idea tag backgrounds |
| **Danger / Slip** | `#E5484D` | `#EF4444` | Habit slips, overdue alerts, deletes |
| **Danger Soft** | `#FFEDED` | `#7F1D1D` | Slip badge backgrounds |
| **Secondary Purple** | `#7D63D8` | `#8B5CF6` | Notes, documents, secondary tags |
| **Purple Soft** | `#F0EDFF` | `#4C1D95` | Note pill backgrounds |

---

## 2. Geometry & Typography

- **Card Border Radius**: `18px` to `22px` (`rounded-3xl` / `rounded-2xl`).
- **Control / Input Radius**: `12px` to `14px` (`rounded-xl`).
- **Button Radius**: `12px` to `14px` (`rounded-xl` or `rounded-full` for circular buttons).
- **Typography**: Inter / Geist / system sans-serif fallback.
  - Headings: `font-bold tracking-tight text-slate-900 dark:text-slate-100`
  - Subheadings & Labels: `text-xs font-semibold text-slate-500 uppercase tracking-wider`
  - Body: `text-sm text-slate-700 dark:text-slate-300 leading-relaxed`
- **Visual Balance Rule**: 80% of the UI remains quiet, clean, and whitespace-rich. Illustrations and accent gradients are strictly reserved for select hero headers and empty states.

---

## 3. UI Component Hierarchy

### 3.1 AppShell & Navigation
- **Desktop (≥ 1200px)**:
  - Width: 260px fixed left sidebar.
  - Sections:
    1. Brand header with "LifeOS" icon and tagline.
    2. Primary "Add New" button with `Cmd+K` keyboard shortcut badge.
    3. Core navigation list (`Today`, `Tasks`, `Money`, `Habits`, `Ideas`, `Career`, `Goals`, `Wishlist`, `Life Admin`).
    4. Focus & Agendas section (`Inbox`, `Calendar`, `Focus Mode`).
    5. Settings & Profile trigger with user avatar card at the base.
- **Tablet (768px – 1199px)**:
  - Width: 72px compact rail with tooltips.
  - Centered icon buttons with active blue indicator dot.
- **Mobile (< 768px)**:
  - Fixed bottom navigation bar with Apple-style backdrop blur (`backdrop-blur-lg bg-white/80 dark:bg-slate-900/80`).
  - Strict 3-element layout:
    - Left: `Today` (Sun icon + label in primary blue when active).
    - Center: `+` (48px vibrant circular cobalt button with white plus icon and soft shadow).
    - Right: `Me` (Person icon + label).

### 3.2 Today Dashboard Cards
1. **Hero Greeting**: Time-aware greeting (`Good morning / afternoon / evening, Poorna`), live formatted date, subtle quote.
2. **Today Tasks Card**:
   - Clean list with custom animated checkboxes.
   - Priority indicators (`Low`, `Normal`, `Important` pill).
   - Due time pill with clock icon.
   - Swipe or hover delete/edit controls.
3. **Money Card**:
   - Budget summary: `£42 left of £150` (`72% spent`).
   - Progress bar with mint green / primary blue fill.
   - Tap opens the full Money & Expense breakdown view.
4. **Habits Card**:
   - Avoid habit: `No impulse buying` with active `6-day streak` badge.
   - Build habit: `Gym` with weekly progress indicator (`4/5 this week`).
5. **Upcoming Card**:
   - Admin & subscription deadlines with countdown badges (`12 days`, `3 days`, `83 days`).
6. **Career Card**:
   - Active interview alert (`Interview tomorrow • ABC Security`).
   - Follow-up alert (`Follow up • XYZ Ltd • Applied 6 days ago`).
7. **Ideas Spark**:
   - Quick glance at top 3 active thoughts with one-tap expansion.

### 3.3 Quick Add Sheet
- Matches the approved UI reference precisely:
  - Top drag handle on mobile.
  - Clean header: `What do you want to add?` with subtitle `Capture something in 3 seconds`.
  - 8 pastel tiles in 2x4 responsive grid:
    1. **Task** (Blue tile)
    2. **Expense** (Emerald tile)
    3. **Idea** (Amber tile)
    4. **Habit** (Rose tile)
    5. **Job** (Cyan tile)
    6. **Note** (Purple tile)
    7. **Goal** (Indigo tile)
    8. **Wishlist** (Pink tile)
  - Bottom input bar: `Type or speak anything...` with deterministic natural language parser and microphone icon.
  - Selecting any tile opens its corresponding dedicated form with instant validation.
