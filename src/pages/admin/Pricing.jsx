import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Alert, Skeleton, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Save, RefreshCw, Rocket, Star, TrendingUp, Crown, Building2, Info, Wallet, FileText, Calculator } from 'lucide-react';

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// Single-plan launch mode: admin edits ONE pricing card (bureau rates +
// wallet guards, backed by the Starter row); it is mirrored to all tiers on
// save (backend mirrors too as a safety net). Set SINGLE_PLAN_MODE=false to
// restore the 5-tier editor below.
// TODO(multi-plan-restore): remove SINGLE_PLAN_MODE + mirror, restore per-tier editing.
const SINGLE_PLAN_MODE = true;
const SINGLE_PLAN_KEY = 'starter';
const SINGLE_PLAN_LABEL = 'Bureau pricing & guards';
const TIERS = [
  { key: 'startup', label: 'Start-Up' },
  { key: 'starter', label: 'Starter' },
  { key: 'growth', label: 'Growth' },
  { key: 'pro', label: 'Pro' },
  { key: 'enterprise', label: 'Enterprise' },
];
// Single-plan inputs: bureau per-pull rates only. No Recharge input — the
// top-up floor lives in Guards (top-level minRecharge). No fail input —
// CIBIL fail bills the same as success.
const SINGLE_MONEY_FIELDS = [
  { key: 'cibil', label: 'CIBIL ₹' },
  { key: 'experian', label: 'Experian ₹' },
  { key: 'crif', label: 'CRIF ₹' },
  { key: 'equifax', label: 'Equifax ₹' },
];
const MONEY_FIELDS = [
  { key: 'recharge', label: 'Recharge ₹' },
  { key: 'cibil', label: 'CIBIL ₹' },
  { key: 'experian', label: 'Experian ₹' },
  { key: 'crif', label: 'CRIF ₹' },
  { key: 'equifax', label: 'Equifax ₹' },
  { key: 'cibilFailed', label: 'CIBIL fail ₹' },
];

const TIER_META = {
  startup: { blurb: 'For individuals and small teams getting started.', icon: Rocket, tint: '#e8f1fe', color: '#2563eb', overviewBg: '#eef4ff' },
  starter: { blurb: 'Best for growing businesses.', icon: Star, tint: '#f1eafe', color: '#7c3aed', overviewBg: '#f3efff', popular: true },
  growth: { blurb: 'For scaling businesses with higher volume.', icon: TrendingUp, tint: '#e9f9f0', color: '#16a34a', overviewBg: '#ecfdf3' },
  pro: { blurb: 'Advanced features and higher limits.', icon: Crown, tint: '#fef3e6', color: '#d97706', overviewBg: '#fef5e7' },
  enterprise: { blurb: 'Dedicated support and custom limits.', icon: Building2, tint: '#efe9ff', color: '#7c3aed', overviewBg: '#f3efff' },
};

const SINGLE_META = { blurb: 'The single live price list — one rate for every partner.', icon: Star, tint: '#f1eafe', color: '#7c3aed', overviewBg: '#f3efff' };

const NumField = ({ label, value, onChange }) => (
  <TextField
    label={label}
    value={value ?? ''}
    onChange={(e) => {
      const v = e.target.value;
      if (/^\d*\.?\d{0,2}$/.test(v)) onChange(v === '' ? '' : Number(v));
    }}
    size="small"
    fullWidth
    slotProps={{ htmlInput: { inputMode: 'decimal' } }}
    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
  />
);

const TierMoneyField = ({ label, value, onChange, hint }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', color: '#8A94A6', fontWeight: 600, mb: 0.5, textAlign: 'center', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
    <TextField
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(v)) onChange(v === '' ? '' : Number(v));
      }}
      size="small"
      fullWidth
      slotProps={{ htmlInput: { inputMode: 'decimal' } }}
      sx={{
        '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem', bgcolor: '#fff' },
        '& .MuiOutlinedInput-input': { textAlign: 'center', padding: '7px 4px' },
      }}
    />
    {hint && (
      <Typography sx={{ fontSize: '0.64rem', color: '#059669', fontWeight: 700, mt: 0.5, textAlign: 'center' }}>
        {hint}
      </Typography>
    )}
  </Box>
);

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const eff = (base, gstRate) => (Number(base) || 0) * (1 + (Number(gstRate) || 0) / 100);

// Module-level on purpose: defining this inside AdminPricing remounts all
// inputs on every keystroke (new component identity per render) and steals
// input focus. Receives everything via props so it never remounts.
const SinglePlanCard = ({ row, onField, minRecharge, lowBalanceThreshold, onFlat }) => {
  const Icon = SINGLE_META.icon;
  return (
    <Paper
      sx={{
        borderRadius: 4, border: '2px solid #c7d2fe', boxShadow: 'none',
        p: { xs: 2, sm: 2.5 }, mb: 2, boxSizing: 'border-box',
      }}
    >
      {/* card identity: title + sub para */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: 3, bgcolor: SINGLE_META.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={SINGLE_META.color} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>{SINGLE_PLAN_LABEL}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mt: 0.25 }}>
            {SINGLE_META.blurb}
          </Typography>
        </Box>
      </Box>

      {/* bureau per-pull rates */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1.25 }}>
        {SINGLE_MONEY_FIELDS.map((f) => (
          <TierMoneyField
            key={f.key}
            label={f.label}
            value={row?.[f.key]}
            onChange={(v) => onField(f.key, v)}
            hint={`${inr(row?.[f.key])} / pull`}
          />
        ))}
      </Box>

      {/* wallet guards — one row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25, mt: 1.5 }}>
        <TierMoneyField
          label="Min recharge ₹"
          value={minRecharge}
          onChange={(v) => onFlat('minRecharge', v)}
          hint="top-up floor"
        />
        <TierMoneyField
          label="Low-wallet ₹"
          value={lowBalanceThreshold}
          onChange={(v) => onFlat('lowBalanceThreshold', v)}
          hint="alert threshold"
        />
      </Box>
    </Paper>
  );
};

// Field-by-field diff vs last loaded/saved snapshot (single-plan scope).
const diffPricing = (cur, saved) => {
  if (!cur || !saved) return [];
  const out = [];
  const row = cur.plans?.[SINGLE_PLAN_KEY] || {};
  const srow = saved.plans?.[SINGLE_PLAN_KEY] || {};
  const labels = { cibil: 'CIBIL ₹', experian: 'Experian ₹', crif: 'CRIF ₹', equifax: 'Equifax ₹' };
  for (const [k, label] of Object.entries(labels)) {
    if (Number(row[k]) !== Number(srow[k])) out.push({ label: `${SINGLE_PLAN_LABEL} · ${label}`, from: srow[k], to: row[k] });
  }
  // No GST fields are editable on this page — totals stay GST-inclusive.
  const pairs = [
    ['ai', 'base', 'AI base ₹'],
    ['aiFail', 'base', 'AI fail ₹'],
    ['rc', 'base', 'RC base ₹'],
    ['gst', 'base', 'GST base ₹'],
    ['otherFailedCharge', 'base', 'Fallback base ₹'],
  ];
  for (const [obj, field, label] of pairs) {
    if (Number(cur[obj]?.[field]) !== Number(saved[obj]?.[field])) out.push({ label, from: saved[obj]?.[field], to: cur[obj]?.[field] });
  }
  for (const [field, label] of [['minRecharge', 'Min recharge ₹'], ['lowBalanceThreshold', 'Low-wallet ₹']]) {
    if (Number(cur[field]) !== Number(saved[field])) out.push({ label, from: saved[field], to: cur[field] });
  }
  return out;
};

const AdminPricing = () => {
  const [pricing, setPricing] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const [sim, setSim] = useState({
    cibil: { succ: 100, fail: 0 }, experian: { succ: 50, fail: 0 }, crif: { succ: 50, fail: 0 },
    equifax: { succ: 50, fail: 0 }, ai: { succ: 20, fail: 0 }, rc: { succ: 100, fail: 0 }, gst: { succ: 100, fail: 0 },
  });
  const setSimField = (k, leg, v) => setSim((s) => ({ ...s, [k]: { ...s[k], [leg]: v === '' ? '' : Number(v) } }));

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await fetch(API('/admin/pricing'), { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (data.success) { setPricing(data.data); setSaved(data.data); }
      else setBanner({ tone: 'error', text: 'Could not load pricing.' });
    } catch {
      setBanner({ tone: 'error', text: 'Could not load pricing.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPricing(); }, []);

  const setPlan = (tier, field, v) => setPricing((p) => ({ ...p, plans: { ...p.plans, [tier]: { ...p.plans[tier], [field]: v } } }));
  const setTop = (key, field, v) => setPricing((p) => ({ ...p, [key]: { ...p[key], [field]: v } }));
  const setFlat = (field, v) => setPricing((p) => ({ ...p, [field]: v }));

  const changes = diffPricing(pricing, saved);

  const handleSaveClick = () => {
    setBanner(null);
    if (changes.length === 0) {
      setBanner({ tone: 'info', text: 'No changes to save — values match the live pricing.' });
      return;
    }
    setDiffOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      setDiffOpen(false);
      setBanner(null);
      // Single-plan mode: mirror the single-plan row across all tiers so no
      // stale tier can diverge. Backend enforces the same mirroring.
      const payload = SINGLE_PLAN_MODE && pricing?.plans?.[SINGLE_PLAN_KEY]
        ? { ...pricing, plans: Object.fromEntries(TIERS.map((t) => [t.key, { ...pricing.plans[SINGLE_PLAN_KEY] }])) }
        : pricing;
      const res = await fetch(API('/admin/pricing'), { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        setPricing(data.data);
        setSaved(data.data);
        setBanner({ tone: 'success', text: 'Pricing saved — applies to new pulls only. Past ledger rows are untouched.' });
      } else {
        setBanner({ tone: 'error', text: data.message || 'Save failed.' });
      }
    } catch {
      setBanner({ tone: 'error', text: 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const row = pricing?.plans?.[SINGLE_PLAN_KEY] || {};
  const aiTotal = eff(pricing?.ai?.base, pricing?.ai?.gstRate);
  const aiFail = Number(pricing?.aiFail?.base ?? pricing?.ai?.base) || 0;
  const rcTotal = eff(pricing?.rc?.base, pricing?.rc?.gstRate);
  const gstTotal = eff(pricing?.gst?.base, pricing?.gst?.gstRate);
  const failRows = [
    { product: 'CIBIL', success: inr(row.cibil), fail: `${inr(row.cibil)} (same)` },
    { product: 'Experian', success: inr(row.experian), fail: `${inr(row.experian)} (same)` },
    { product: 'CRIF', success: inr(row.crif), fail: `${inr(row.crif)} (same)` },
    { product: 'Equifax', success: inr(row.equifax), fail: `${inr(row.equifax)} (same)` },
    { product: 'AI analysis', success: inr(aiTotal), fail: `${inr(aiFail)} flat` },
    { product: 'RC verification', success: inr(rcTotal), fail: `${inr(rcTotal)} (same)` },
    { product: 'GST verification', success: inr(gstTotal), fail: `${inr(gstTotal)} (same)` },
  ];
  // Simulator rates = live effective rates (same source as the Success/Fail table above).
  const SIM_PRODUCTS = [
    { key: 'cibil', label: 'CIBIL' }, { key: 'experian', label: 'Experian' },
    { key: 'crif', label: 'CRIF' }, { key: 'equifax', label: 'Equifax' },
    { key: 'ai', label: 'AI' }, { key: 'rc', label: 'RC' }, { key: 'gst', label: 'GST' },
  ];
  const simRates = {
    cibil: { succ: Number(row.cibil) || 0, fail: Number(row.cibil) || 0 },
    experian: { succ: Number(row.experian) || 0, fail: Number(row.experian) || 0 },
    crif: { succ: Number(row.crif) || 0, fail: Number(row.crif) || 0 },
    equifax: { succ: Number(row.equifax) || 0, fail: Number(row.equifax) || 0 },
    ai: { succ: aiTotal, fail: aiFail },
    rc: { succ: rcTotal, fail: rcTotal },
    gst: { succ: gstTotal, fail: gstTotal },
  };
  const simRows = SIM_PRODUCTS.map((p) => {
    const succ = Number(sim[p.key]?.succ) || 0;
    const fail = Number(sim[p.key]?.fail) || 0;
    const succAmt = succ * simRates[p.key].succ;
    const failAmt = fail * simRates[p.key].fail;
    return { ...p, succ, fail, succRate: simRates[p.key].succ, failRate: simRates[p.key].fail, amount: succAmt + failAmt, failAmt };
  });
  const simTotal = simRows.reduce((s, r) => s + r.amount, 0);
  const simFailTotal = simRows.reduce((s, r) => s + r.failAmt, 0);

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Pricing Control</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {SINGLE_PLAN_MODE
              ? 'Single launch plan for all partners. Changes apply to new pulls only and will never be applied retroactively.'
              : 'Set per-tier report prices. Changes apply to new pulls only and will never be applied retroactively.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RefreshCw size={13} />} onClick={fetchPricing}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, px: 2 }}>
            Reload
          </Button>
          <Button size="small" variant="contained" disableElevation startIcon={<Save size={14} />} onClick={handleSaveClick} disabled={saving || loading}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, px: 2, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', bgcolor: '#eef4ff', borderRadius: 3, p: 2, mb: 2.5 }}>
        <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
        <Typography variant="body2" sx={{ color: '#33415C', fontSize: '0.82rem' }}>
          <Box component="span" sx={{ fontWeight: 800 }}>How pricing works? </Box>
          One plan for every partner. Recharge is the minimum wallet balance (nothing is deducted). Bureau + RC/GST failures bill the same as success; AI failure is the base with no GST.
        </Typography>
      </Box>

      {banner && <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2, borderRadius: 2 }}>{banner.text}</Alert>}

      {loading || !pricing ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2.5 }} />
      ) : (
        <>
          {!SINGLE_PLAN_MODE && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Plan tiers</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Configure report prices for each partner plan.
              </Typography>
            </Box>
          )}
          {SINGLE_PLAN_MODE ? (
            <SinglePlanCard
              row={row}
              onField={(f, v) => setPlan(SINGLE_PLAN_KEY, f, v)}
              minRecharge={pricing.minRecharge}
              lowBalanceThreshold={pricing.lowBalanceThreshold}
              onFlat={setFlat}
            />
          ) : (
            /* TODO(multi-plan-restore): this 5-tier editor returns when SINGLE_PLAN_MODE=false */
            TIERS.map((t) => {
              const meta = TIER_META[t.key] || TIER_META.starter;
              const Icon = meta.icon;
              const trow = pricing.plans?.[t.key] || {};
              return (
                <Paper
                  key={t.key}
                  sx={{
                    borderRadius: 4, border: '1px solid #E8EEF5', boxShadow: 'none',
                    p: { xs: 2, sm: 2.5 }, mb: 2,
                    display: 'flex', gap: { xs: 2, md: 3 }, alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 200, maxWidth: 250, flex: '1 1 200px' }}>
                    <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: 3, bgcolor: meta.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={meta.color} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{t.label}</Typography>
                        {meta.popular && (
                          <Chip label="Most popular" size="small" sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mt: 0.25 }}>
                        {meta.blurb}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 1.25, flex: '6 1 420px', minWidth: 280 }}>
                    {MONEY_FIELDS.map((f) => (
                      <TierMoneyField
                        key={f.key}
                        label={f.label}
                        value={pricing.plans?.[t.key]?.[f.key]}
                        onChange={(v) => setPlan(t.key, f.key, v)}
                      />
                    ))}
                  </Box>
                  <Box sx={{ bgcolor: meta.overviewBg, borderRadius: 3, p: 1.75, minWidth: 180, flex: '1 1 180px', maxWidth: 230 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: meta.color, display: 'block', mb: 1 }}>
                      Plan overview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                      <Wallet size={13} color={meta.color} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Min. recharge: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>₹{Number(trow.recharge ?? 0).toLocaleString('en-IN')}</Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileText size={13} color={meta.color} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Reports: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{MONEY_FIELDS.length - 1} types</Box>
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })
          )}

          {/* What partners pay — live fail-policy summary */}
          <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>What partners pay</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1.5 }}>Live preview — updates as you type, before saving.</Typography>
            {failRows.map((r) => (
              <Box key={r.product} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.75, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.product}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                  Success <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{r.success}</Box>
                  {' · '}Fail <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{r.fail}</Box>
                </Typography>
              </Box>
            ))}
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>AI analysis</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Flat across all tiers · totals include GST</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <NumField label="Base ₹" value={pricing.ai?.base} onChange={(v) => setTop('ai', 'base', v)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <NumField label="Failure fallback ₹ (flat)" value={pricing.aiFail?.base} onChange={(v) => setTop('aiFail', 'base', v)} />
                  </Grid>
                </Grid>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mt: 1.5 }}>
                  Effective: ₹{aiTotal.toFixed(2)} · Fail: ₹{aiFail.toFixed(2)} flat
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>RC / GST verification</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Success or fail — both bill this rate</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <NumField label="RC base ₹" value={pricing.rc?.base} onChange={(v) => setTop('rc', 'base', v)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <NumField label="GST base ₹" value={pricing.gst?.base} onChange={(v) => setTop('gst', 'base', v)} />
                  </Grid>
                </Grid>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mt: 1.5 }}>
                  Effective: RC ₹{rcTotal.toFixed(2)} · GST ₹{gstTotal.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            {/* Hidden in single-plan mode — value retained in DB for multi-plan restore.
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>Failure fallback</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Unused in single-plan mode (bureaus = success price, AI has its own fallback above, RC/GST = ₹10) · applies on multi-plan restore</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <NumField label="Base ₹" value={pricing.otherFailedCharge?.base} onChange={(v) => setTop('otherFailedCharge', 'base', v)} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Calculator size={15} color="#2563eb" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Revenue simulator</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1.5 }}>Per-product success × fail volumes at live rates. Fail legs use the fail rates from the table above.</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.4fr 1fr', gap: 1, alignItems: 'center', px: 0.5 }}>
                    {['Product', 'Success', 'Failed', 'Rate applied', 'Amount'].map((h) => (
                      <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: '#8A94A6', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: h === 'Product' ? 'left' : 'center' }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>
                  {simRows.map((r) => (
                    <Box key={r.key} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.4fr 1fr', gap: 1, alignItems: 'center', bgcolor: '#F8FAFC', borderRadius: 2, px: 1, py: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{r.label}</Typography>
                      <NumField label="Succ" value={sim[r.key]?.succ} onChange={(v) => setSimField(r.key, 'succ', v)} />
                      <NumField label="Fail" value={sim[r.key]?.fail} onChange={(v) => setSimField(r.key, 'fail', v)} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.4 }}>
                        {inr(r.succRate)} / {inr(r.failRate)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.82rem', textAlign: 'right' }}>
                        ₹{Math.round(r.amount).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    ≈ ₹{Math.round(simTotal).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    of which fail-fees ₹{Math.round(simFailTotal).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Save diff confirm */}
      <Dialog open={diffOpen} onClose={() => !saving && setDiffOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm pricing changes?</DialogTitle>
        <DialogContent dividers>
          {changes.map((c) => (
            <Box key={c.label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{c.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {String(c.from ?? '—')} → {String(c.to ?? '—')}
              </Typography>
            </Box>
          ))}
          <Alert severity="info" sx={{ mt: 1.5, borderRadius: 1 }}>
            Applies to new pulls only — past ledger rows are untouched. In single-plan mode the bureau row mirrors to all tiers.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDiffOpen(false)} color="inherit" disabled={saving}>Cancel</Button>
          <Button variant="contained" disableElevation disabled={saving} onClick={handleConfirmSave}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#2563eb' }}>
            {saving ? 'Saving…' : 'Confirm & Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPricing;
