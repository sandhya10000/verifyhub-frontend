import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Alert, Skeleton, Chip } from '@mui/material';
import { Save, RefreshCw, Rocket, Star, TrendingUp, Crown, Building2, Info, Wallet, FileText } from 'lucide-react';

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// Single-plan launch mode: admin edits the Starter row; it is mirrored to all
// tiers on save (backend mirrors too as a safety net).
// TODO(multi-plan-restore): remove SINGLE_PLAN_MODE + mirror, restore per-tier editing.
const SINGLE_PLAN_MODE = true;
const SINGLE_PLAN_KEY = 'starter';
const TIERS = [
  { key: 'startup', label: 'Start-Up' },
  { key: 'starter', label: 'Starter' },
  { key: 'growth', label: 'Growth' },
  { key: 'pro', label: 'Pro' },
  { key: 'enterprise', label: 'Enterprise' },
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

const TierMoneyField = ({ label, value, onChange }) => (
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
  </Box>
);

const AdminPricing = () => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await fetch(API('/admin/pricing'), { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (data.success) setPricing(data.data);
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

  const handleSave = async () => {
    try {
      setSaving(true);
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

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Pricing Control</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Set per-tier report prices. Changes apply to new pulls only and will never be applied retroactively.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RefreshCw size={13} />} onClick={fetchPricing}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, px: 2 }}>
            Reload
          </Button>
          <Button size="small" variant="contained" disableElevation startIcon={<Save size={14} />} onClick={handleSave} disabled={saving || loading}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, px: 2, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', bgcolor: '#eef4ff', borderRadius: 3, p: 2, mb: 2.5 }}>
        <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
        <Typography variant="body2" sx={{ color: '#33415C', fontSize: '0.82rem' }}>
          <Box component="span" sx={{ fontWeight: 800 }}>How pricing works? </Box>
          Recharge amount is the minimum wallet balance required to use a plan (nothing is deducted). The fail column is the charge for a CIBIL failure on that tier.
        </Typography>
      </Box>

      {SINGLE_PLAN_MODE && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Single-plan mode is ON — edit the Starter row and it will be mirrored to all tiers on save. Live rates: CIBIL ₹60 · Experian ₹40 · CRIF ₹50 · Equifax ₹40 · AI ₹118 (fail ₹100 flat) · RC/GST ₹10 (fail ₹10) · min recharge ₹1,000. Remove the flag in code to restore multi-tier editing.
        </Alert>
      )}

      {banner && <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2, borderRadius: 2 }}>{banner.text}</Alert>}

      {loading || !pricing ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2.5 }} />
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Plan tiers</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Configure report prices for each partner plan.
            </Typography>
          </Box>
          {TIERS.map((t) => {
            const meta = TIER_META[t.key] || TIER_META.starter;
            const Icon = meta.icon;
            const row = pricing.plans?.[t.key] || {};
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
                {/* tier identity */}
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

                {/* money inputs */}
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

                {/* plan overview */}
                <Box sx={{ bgcolor: meta.overviewBg, borderRadius: 3, p: 1.75, minWidth: 180, flex: '1 1 180px', maxWidth: 230 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: meta.color, display: 'block', mb: 1 }}>
                    Plan overview
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <Wallet size={13} color={meta.color} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Min. recharge: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>₹{Number(row.recharge ?? 0).toLocaleString('en-IN')}</Box>
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
          })}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>AI analysis</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Flat across all tiers · single-plan fail is base with no GST (₹100)</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <NumField label="Base ₹" value={pricing.ai?.base} onChange={(v) => setTop('ai', 'base', v)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <NumField label="GST %" value={pricing.ai?.gstRate} onChange={(v) => setTop('ai', 'gstRate', v)} />
                  </Grid>
                </Grid>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mt: 1.5 }}>
                  Effective: ₹{((pricing.ai?.base || 0) * (1 + (pricing.ai?.gstRate || 0) / 100)).toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>Failure fallback</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Unused in single-plan mode (bureaus = success price, AI = ₹100 flat, RC/GST = ₹10) · applies on multi-plan restore</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <NumField label="Base ₹" value={pricing.otherFailedCharge?.base} onChange={(v) => setTop('otherFailedCharge', 'base', v)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <NumField label="GST %" value={pricing.otherFailedCharge?.gstRate} onChange={(v) => setTop('otherFailedCharge', 'gstRate', v)} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Guards</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <NumField label="Min recharge ₹" value={pricing.minRecharge} onChange={(v) => setFlat('minRecharge', v)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <NumField label="Low-wallet ₹" value={pricing.lowBalanceThreshold} onChange={(v) => setFlat('lowBalanceThreshold', v)} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminPricing;
