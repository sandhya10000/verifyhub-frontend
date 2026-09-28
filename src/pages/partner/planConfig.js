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
