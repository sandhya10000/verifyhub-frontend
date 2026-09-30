import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Alert, Skeleton, Divider, Chip } from '@mui/material';
import { Save, RefreshCw } from 'lucide-react';

const API = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

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
      const res = await fetch(API('/admin/pricing'), { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(pricing) });
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
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Per-tier report prices · edits apply to new pulls only, never retroactively
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="text" startIcon={<RefreshCw size={13} />} onClick={fetchPricing}>Reload</Button>
          <Button size="small" variant="contained" disableElevation startIcon={<Save size={14} />} onClick={handleSave} disabled={saving || loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      </Box>

      {banner && <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2, borderRadius: 2 }}>{banner.text}</Alert>}

      {loading || !pricing ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2.5 }} />
      ) : (
        <>
          <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>Plan tiers</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
              Recharge = slab that activates the tier · fail column = CIBIL failure fee on that tier
            </Typography>
            {TIERS.map((t, i) => (
              <Box key={t.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, width: 96, flexShrink: 0 }}>{t.label}</Typography>
                  {i === 1 && <Chip label="Most popular" size="small" sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />}
                </Box>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {MONEY_FIELDS.map((f) => (
                    <Grid key={f.key} size={{ xs: 6, sm: 4, md: 2 }}>
                      <NumField label={f.label} value={pricing.plans?.[t.key]?.[f.key]} onChange={(v) => setPlan(t.key, f.key, v)} />
                    </Grid>
                  ))}
                </Grid>
                {i < TIERS.length - 1 && <Divider sx={{ mb: 2 }} />}
              </Box>
            ))}
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>AI analysis</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Flat across all tiers · failures bill the fallback below</Typography>
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
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Non-CIBIL + AI failures, any tier</Typography>
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
