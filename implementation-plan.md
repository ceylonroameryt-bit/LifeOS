> Historical product specification. See [README.md](README.md) for the current implementation, validation commands, deployment requirements, and limitations.

# LifeOS — Phased Implementation Plan & Verification Matrix

---

## Phase Overview & Roadmap

### Phase 0: System Analysis & Architecture (Current)
- [x] Repository audit & dependency verification.
- [x] Inspection of approved visual design reference.
- [x] Comprehensive architectural documentation (`architecture.md`, `database.md`, `routes.md`, `ui-spec.md`, `security.md`, `testing.md`).
- [x] Verification of production build status (`npm run build`).

### Phase 1: Foundation & Core Execution (Verified Baseline)
- [x] Responsive AppShell (Desktop w-64 sidebar, Tablet w-16 rail, Mobile Today/+ bottom bar).
- [x] Design token system in `tailwind.config.ts` matching reference palette.
- [x] Supabase client configuration with local fallback persistence.
- [x] Today Hero greeting with dynamic local date and time-of-day greeting.
- [x] Today Tasks card with interactive completion, deletion, priority tags, and persistence.
- [x] Quick Add bottom sheet modal matching reference with natural language input bar and 8 pastel tiles.
- [x] Working Add Task form matching reference layout.

### Phase 2: Money & Budget Module
- [x] Weekly & Monthly budget progress bar (£42 left of £150, 72% spent).
- [x] Expense logging with numeric validation, categories, and date selection.
- [x] Expense categories breakdown with custom icons.
- [x] Subscriptions tracker with renewal dates feeding into Today Upcoming.
- [x] Savings goals with target vs current balance progress rings.

### Phase 3: Habits Module (Build & Avoid)
- [ ] Positive "Build" habit tracking with weekly targets (e.g. Gym 4/5) and Mon-Sun completion dots.
- [ ] "Avoid" habit tracking (e.g. No impulse buying) with active streak counter.
- [ ] Slip trigger modal ("What happened?" - Bored, Stress, Saw something online, Other).
- [ ] Factual habit insights (best streak, most common slip trigger).

### Phase 4: Ideas & Goals Module
- [ ] Idea vault with status badges (Inbox, Saved, Working On, Done, Archived).
- [ ] Instant "Convert Idea to Task" workflow.
- [ ] Life goals with percentage progress bars and next immediate actions.

### Phase 5: Career & Jobs Module
- [ ] Job application tracker with status pipeline (Saved, Applied, Screening, Interview, Offer, Rejected).
- [ ] Add Job modal matching approved reference layout.
- [ ] Job detail view with recruiter notes, CV version link, and interview stage.
- [ ] Follow-up alerts ("Applied 6 days ago — Remind tomorrow / Mark followed up").
- [ ] Interview schedule with preparation checklist (STAR examples, company research).

### Phase 6: Life Admin & Calendar Module
- [ ] Admin contract countdowns (Car insurance, Passport, MOT, Subscriptions) with days-remaining pills.
- [ ] Unified Calendar agenda view aggregating tasks, interviews, and renewals.

### Phase 7: Wishlist & Impulse Prevention
- [ ] 48-hour wait-before-buying countdown clock.
- [ ] Interactive resolution: "Buy", "Keep Waiting", "I Don't Need It".

### Phase 8: Profile, Insights & Weekly Review
- [ ] Profile / Me view with domain summary rows and avatar management.
- [ ] Theme switcher (System, Light, Dark).
- [ ] Behavioral profiling based strictly on user data.
- [ ] Weekly Review workflow with review metrics and Top 3 priorities selection for next week.

### Phase 9: Focus Mode & Search Everything
- [ ] Zen 25-minute Pomodoro focus timer with calm dark theme, start/pause/complete actions.
- [ ] Global search palette (`Cmd+K` / `Ctrl+K`) categorizing results across all modules.

### Phase 10: PWA & Offline Sync
- [ ] Web App Manifest (`manifest.json` / `manifest.webmanifest`) and service worker.
- [ ] Offline local storage queue with automatic sync on reconnection.

### Phase 11: AI Assistant
- [ ] Server-side AI assistant for job analysis, interview prep, and weekly retrospective.
- [ ] Graceful fallback when API credentials are absent.
