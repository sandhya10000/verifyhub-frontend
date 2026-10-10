// Shared plan catalogue (founder table) + helpers for Plans / AddFunds pages.
// Live prices refresh from the public pricing API; this is the instant fallback.
// Single-plan launch mode: one effective plan ("starter"). All rows identical
// so stale activePlan values render correctly. Flip SINGLE_PLAN_MODE to false
// and restore the commented tables to bring multi-tier back.
// TODO(multi-plan-restore): restore 5-row FALLBACK_PLANS / PLAN_META / TIER_RANGES below.
export const SINGLE_PLAN_MODE = true;
export const SINGLE_PLAN_KEY = 'starter';
export const SINGLE_PLAN_ROW = { recharge: 1000, cibil: 60, experian: 40, crif: 50, equifax: 40, cibilFailed: 60 };

export const FALLBACK_PLANS = {
  startup: { ...SINGLE_PLAN_ROW },
  starter: { ...SINGLE_PLAN_ROW },
  growth: { ...SINGLE_PLAN_ROW },
  pro: { ...SINGLE_PLAN_ROW },
  enterprise: { ...SINGLE_PLAN_ROW },
};
// TODO(multi-plan-restore): FALLBACK_PLANS was:
// startup {200,120,95,95,85,90}, starter {1000,110,85,85,80,80},
// growth {5000,90,65,65,60,70}, pro {10000,80,50,55,50,60},
// enterprise {25000,65,35,45,40,50}

export const PLAN_META = [
  { key: 'starter', label: 'Starter', tagline: 'Single launch plan', highlight: true },
];
// TODO(multi-plan-restore): PLAN_META was startup/Starter/growth(highlight)/pro/enterprise

export const planLabel = (key) => (PLAN_META.find((p) => p.key === key)?.label || key);

export const inr0 = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const inr2 = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

// Tier ladder (matches backend tierForAmount slabs in Pricing.js).
// Single-plan mode: one rung only.
// TODO(multi-plan-restore): restore 5-rung ladder (200/1000/5000/10000/25000+).
export const TIER_RANGES = [
  { key: 'starter', tier: 1, min: 1000, max: null },
];

export const tierRangeLabel = (key) => {
  const r = TIER_RANGES.find((t) => t.key === key);
  if (!r) return '';
  return r.max == null ? `${inr0(r.min)} and above` : `${inr0(r.min)} – ${inr0(r.max)}`;
};

// Next tier above the given plan key (null when already at top).
export const nextTier = (key) => {
  const idx = TIER_RANGES.findIndex((t) => t.key === key);
  if (idx === -1) return TIER_RANGES[0];
  return TIER_RANGES[idx + 1] || null;
};

// Per-report saving of a plan's CIBIL rate vs the Start-Up (cheapest) rate.
export const savingVsStartup = (plans, key) => {
  const base = Number(plans?.startup?.cibil || 0);
  const rate = Number(plans?.[key]?.cibil || 0);
  if (!base || !rate || key === 'startup') return 0;
  return Math.max(0, base - rate);
};

// Approx CIBIL pulls fundable at a tier's minimum top-up.
export const pullsAtMinimum = (plans, key) => {
  const r = TIER_RANGES.find((t) => t.key === key);
  const rate = Number(plans?.[key]?.cibil || 0);
  if (!r || !rate) return 0;
  return Math.floor(r.min / rate);
};
