// Shared plan catalogue (founder table) + helpers for Plans / AddFunds pages.
// Live prices refresh from the public pricing API; this is the instant fallback.

export const FALLBACK_PLANS = {
  startup: { recharge: 200, cibil: 120, experian: 95, crif: 95, equifax: 85, cibilFailed: 90 },
  starter: { recharge: 1000, cibil: 110, experian: 85, crif: 85, equifax: 80, cibilFailed: 80 },
  growth: { recharge: 5000, cibil: 90, experian: 65, crif: 65, equifax: 60, cibilFailed: 70 },
  pro: { recharge: 10000, cibil: 80, experian: 50, crif: 55, equifax: 50, cibilFailed: 60 },
  enterprise: { recharge: 25000, cibil: 65, experian: 35, crif: 45, equifax: 40, cibilFailed: 50 },
};

export const PLAN_META = [
  { key: 'startup', label: 'Start-Up', tagline: 'First top-up' },
  { key: 'starter', label: 'Starter', tagline: 'Try it out' },
  { key: 'growth', label: 'Growth', tagline: 'Most popular', highlight: true },
  { key: 'pro', label: 'Pro', tagline: 'High volume' },
  { key: 'enterprise', label: 'Enterprise', tagline: 'Best value' },
];

export const planLabel = (key) => (PLAN_META.find((p) => p.key === key)?.label || key);

export const inr0 = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const inr2 = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

// Tier ladder (matches backend tierForAmount slabs in Pricing.js).
export const TIER_RANGES = [
  { key: 'startup', tier: 1, min: 200, max: 999 },
  { key: 'starter', tier: 2, min: 1000, max: 4999 },
  { key: 'growth', tier: 3, min: 5000, max: 9999 },
  { key: 'pro', tier: 4, min: 10000, max: 24999 },
  { key: 'enterprise', tier: 5, min: 25000, max: null },
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
