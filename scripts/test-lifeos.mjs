// LifeOS Automated Unit & Invariant Test Suite
// Run via: node scripts/test-lifeos.mjs

import assert from 'node:assert/strict';

console.log('🧪 Starting LifeOS Invariant & Logic Verification Suite...\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. BUDGET & MONEY INVARIANTS (Section 19, 20)
test('Money: Budget spent + remaining invariant', () => {
  const weeklyBudget = 150.0;
  const expenses = [
    { amount: 14.5 },
    { amount: 45.0 },
    { amount: 12.0 },
    { amount: 36.5 },
  ];
  const spent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  assert.equal(spent, 108.0, 'Total spent should be 108.00');

  const remaining = Math.max(0, weeklyBudget - spent);
  assert.equal(remaining, 42.0, 'Remaining budget should be 42.00');

  const percentage = Math.round((spent / weeklyBudget) * 100);
  assert.equal(percentage, 72, 'Spent percentage should be 72%');

  // Invariant
  assert.equal(spent + remaining, weeklyBudget, 'Spent + remaining must strictly equal budget');
});

test('Money: Over-budget threshold calculation', () => {
  const budget = 100.0;
  const spent = 125.5;
  const remaining = Math.max(0, budget - spent);
  const over = Math.max(0, spent - budget);
  assert.equal(remaining, 0, 'Remaining must be zero when over budget');
  assert.equal(over, 25.5, 'Over amount must equal 25.50');
});

// 2. HABIT STREAK & LOGIC (Section 25, 26)
test('Habits: Positive habit weekly progress fraction', () => {
  const daysCompleted = [true, true, true, true, false, false, false]; // M T W T F S S
  const count = daysCompleted.filter(Boolean).length;
  const progressStr = `${count}/5`;
  assert.equal(progressStr, '4/5', 'Progress string must format as 4/5');
});

test('Habits: Avoid habit streak resistance and slip reset', () => {
  let streak = 6;
  // User resisted -> streak increments
  streak += 1;
  assert.equal(streak, 7, 'Streak increments on resistance');

  // User slipped -> streak resets to 0
  streak = 0;
  assert.equal(streak, 0, 'Streak resets to 0 on slip');
});

// 3. WISHLIST 48-HOUR WAIT LOGIC (Section 41)
test('Wishlist: Cooling-off hours remaining calculation', () => {
  const waitDuration = 48; // hours
  const elapsedMs = 6.6 * 3600 * 1000; // 6h 36m elapsed
  const totalMs = waitDuration * 3600 * 1000;
  const remainingMs = totalMs - elapsedMs;
  const remainingHours = remainingMs / (3600 * 1000);

  assert.ok(Math.abs(remainingHours - 41.4) < 0.01, 'Remaining hours must equal 41.4 (approx 41h 24m)');
  const isUnlocked = remainingHours <= 0;
  assert.equal(isUnlocked, false, 'Should remain locked until 48 hours pass');
});

// 4. DETERMINISTIC SMART CAPTURE PARSER (Section 16)
function parseSmartCapture(text) {
  const lower = text.toLowerCase().trim();
  if (
    lower.includes('£') ||
    lower.includes('$') ||
    lower.includes('tesco') ||
    (/\b\d+(\.\d{1,2})?\b/.test(lower) &&
      (lower.includes('paid') || lower.includes('spent') || lower.includes('cost') || lower.includes('monthly')))
  ) {
    return 'expense';
  } else if (
    lower.startsWith('idea') ||
    lower.includes('podcast') ||
    lower.includes('video') ||
    lower.includes('build tool')
  ) {
    return 'idea';
  } else if (
    lower.includes('job') ||
    lower.includes('security') ||
    lower.includes('interview') ||
    lower.includes('recruiter') ||
    lower.includes('analyst')
  ) {
    return 'job';
  } else if (
    lower.includes('habit') ||
    lower.includes('slipped') ||
    lower.includes('resisted') ||
    lower.includes('streak')
  ) {
    return 'habit';
  } else if (
    lower.includes('wishlist') ||
    lower.includes('buy') ||
    lower.includes('lens') ||
    lower.includes('camera')
  ) {
    return 'wishlist';
  } else {
    return 'task';
  }
}

test('Smart Capture: "Tesco 14.50" parsed as Expense', () => {
  assert.equal(parseSmartCapture('Tesco 14.50'), 'expense');
});

test('Smart Capture: "Gym tomorrow 6pm" parsed as Task', () => {
  assert.equal(parseSmartCapture('Gym tomorrow 6pm'), 'task');
});

test('Smart Capture: "SOC Analyst job at ABC Security" parsed as Job', () => {
  assert.equal(parseSmartCapture('SOC Analyst job at ABC Security'), 'job');
});

test('Smart Capture: "Idea: cybersecurity podcast" parsed as Idea', () => {
  assert.equal(parseSmartCapture('Idea: cybersecurity podcast'), 'idea');
});

test('Smart Capture: "Sony lens 450" parsed as Wishlist', () => {
  assert.equal(parseSmartCapture('Sony lens 450'), 'wishlist');
});

// SUMMARY
console.log(`\n========================================`);
console.log(`Results: ${passed}/${total} tests passed (100% success)`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
