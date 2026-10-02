import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import axios from 'axios';
import {
  FALLBACK_PLANS, PLAN_META, planLabel, inr0, inr2,
  TIER_RANGES, tierRangeLabel, nextTier, savingVsStartup, pullsAtMinimum,
} from './planConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';



const Plans = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, login, refreshWallet } = useAuth();
  // Forced plan flow: set after a pure top-up (server flag), via ?choosePlan=1.
  const forcedPick = searchParams.get('choosePlan') === '1' || user?.pendingPlanChoice === true;
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [aiTotal, setAiTotal] = useState(118);
  const [otherFail, setOtherFail] = useState(30);
  const [banner, setBanner] = useState(null);
  const [paying, setPaying] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(null);

  useEffect(() => {
    // Refresh balance + active plan (stored login payload may predate them).
    refreshWallet?.();
    axios.get(`${API_BASE_URL}/partner/pricing/plans`)
      .then(({ data }) => {
        if (data?.success) {
          if (data.data?.plans) setPlans(data.data.plans);
          if (data.data?.ai?.total != null) setAiTotal(data.data.ai.total);
          if (data.data?.otherFailedCharge != null) setOtherFail(data.data.otherFailedCharge);
        }
      })
      .catch(() => { /* fallback table stays */ });
  }, []);

  const handleActivate = async (planKey) => {
    try {
      setPaying(true);
      setConfirmPlan(null);
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const { data } = await axios.post(`${API_BASE_URL}/plan/activate`, { plan: planKey }, { headers });
      if (data?.success) {
        if (user && token) {
          login({
            ...user,
            walletBalance: data.walletBalance ?? user.walletBalance,
            activePlan: data.activePlan || user.activePlan,
            pendingPlanChoice: false,
          }, token);
        }
        // Forced flow complete — release the lock and drop the query param.
        if (searchParams.get('choosePlan') === '1') {
          setSearchParams({}, { replace: true });
        }
        setBanner({
          tone: 'success',
          text: `${planLabel(data.activePlan)} plan selected · free, nothing deducted. Balance ₹${Number(data.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}. Reports now bill at ${planLabel(data.activePlan)} rates.`,
        });
      } else {
        setBanner({ tone: 'error', text: data?.message || 'Could not activate plan.' });
      }
    } catch (err) {
      console.error('Plan activation error:', err);
      setBanner({ tone: 'error', text: err?.response?.data?.message || 'Could not activate plan.' });
    } finally {
      setPaying(false);
    }
  };

  const goTopUp = (min) => navigate(`/partner/add-funds${min ? `?amount=${min}` : ''}`);

  // Smart plan-button flow (plans are free — the slab is eligibility only):
  // - wallet covers the tier slab  -> open the select confirm dialog
  // - wallet short                  -> AddFunds prefilled with the shortfall
  //   plus an alert naming the remaining amount and the plan.
  const handlePlanButton = (planKey) => {
    const threshold = Number(plans?.[planKey]?.recharge || 0);
    const balance = Number(user?.walletBalance || 0);
    if (balance >= threshold) {
      setConfirmPlan(planKey);
      return;
    }
    const shortfall = Math.max(0, Math.ceil((threshold - balance) * 100) / 100);
    navigate(`/partner/add-funds?amount=${shortfall}&forPlan=${encodeURIComponent(planLabel(planKey))}`);
  };

  const activeRow = (user?.activePlan && plans[user.activePlan]) || null;
  const next = nextTier(user?.activePlan);
  const nextHint = next
    ? `Next tier: ${planLabel(next.key)}. Top up ${inr0(next.min)} or more in one go.`
    : user?.activePlan ? 'You are on the highest tier.' : `Top up ${inr0(TIER_RANGES[0].min)} or more to get started.`;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
            Plans &amp; rates
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Plans are free to select — keep the tier&apos;s balance in your wallet to unlock cheaper pulls. Only generated reports are charged.
          </Typography>
        </Box>
        <Button
          variant="contained" disableElevation
          onClick={() => goTopUp()}
          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3', whiteSpace: 'nowrap', px: 2.5, py: 1 }}
        >
          Top up wallet
        </Button>
      </Box>

      {banner && (
        <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2.5, borderRadius: 1 }}>
          {banner.text}
        </Alert>
      )}

      {/* Status strip */}
      <Paper elevation={0} sx={{ border: '1px solid #E8EEF5', borderRadius: 1, px: 3, py: 2, mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Active plan</Typography>
          <Typography sx={{ fontWeight: 800 }}>{user?.activePlan ? planLabel(user.activePlan) : '—'}</Typography>
        </Box>
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Wallet balance</Typography>
          <Typography sx={{ fontWeight: 800 }}>{user?.walletBalance != null ? inr2(user.walletBalance) : '—'}</Typography>
        </Box>
        <Box sx={{ minWidth: 140 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Your CIBIL rate</Typography>
          <Typography sx={{ fontWeight: 800 }}>
            {activeRow ? `${inr0(activeRow.cibil)} per report` : '—'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200, textAlign: { xs: 'left', md: 'right' } }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{nextHint}</Typography>
        </Box>
      </Paper>

      {/* Tier ladder */}
      <Paper elevation={0} sx={{ border: '1px solid #E8EEF5', borderRadius: 1, mb: 2.5, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' } }}>
          {TIER_RANGES.map((t) => {
            const isHere = user?.activePlan === t.key;
            return (
              <Box
                key={t.key}
                sx={{
                  px: 2.5, py: 1.75,
                  borderTop: isHere ? '3px solid #3730A3' : '3px solid transparent',
                  borderLeft: { xs: 'none', md: '1px solid #EEF1F6' },
                  '&:first-of-type': { borderLeft: 'none' },
                  bgcolor: isHere ? '#F5F3FF' : '#fff',
                }}
              >
                {isHere && (
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: '#3730A3', mb: 0.25 }}>
                    YOU ARE HERE
                  </Typography>
                )}
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', color: 'text.secondary' }}>
                  TIER {t.tier}
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>{planLabel(t.key)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{tierRangeLabel(t.key)}</Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Plan cards + how-it-works */}
      <Grid container spacing={2}>
        {PLAN_META.map((p) => {
          const row = plans[p.key] || {};
          const isCurrent = user?.activePlan === p.key;
          const saving = savingVsStartup(plans, p.key);
          const pulls = pullsAtMinimum(plans, p.key);
          const range = TIER_RANGES.find((t) => t.key === p.key);
          const topUpLabel = range.max == null
            ? `Top up ${inr0(range.min)} and above`
            : `Top up ${inr0(range.min)} – ${inr0(range.max)}`;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5, borderRadius: 1, border: '2px solid',
                  borderColor: isCurrent ? '#3730A3' : '#E8EEF5',
                  bgcolor: '#fff', position: 'relative', height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{p.label}</Typography>
                  {isCurrent ? (
                    <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontSize: '0.62rem', fontWeight: 800, height: 22 }} />
                  ) : p.highlight ? (
                    <Chip label="Most popular" size="small" sx={{ bgcolor: '#3730A3', color: '#fff', fontSize: '0.62rem', fontWeight: 700, height: 22 }} />
                  ) : null}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>CIBIL report</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.25 }}>
                  {inr0(row.cibil)}
                </Typography>
                <Typography variant="caption" sx={{ color: saving > 0 ? '#0E9F6E' : 'text.secondary', fontWeight: saving > 0 ? 700 : 400, display: 'block', mb: 1.5 }}>
                  {saving > 0 ? `Save ${inr0(saving)} per CIBIL report vs Start-Up` : 'Standard rates'}
                </Typography>
                <Box sx={{ bgcolor: '#F4F6FA', borderRadius: 1, px: 1.5, py: 1, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{topUpLabel}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>≈ {pulls} CIBIL pulls at the minimum</Typography>
                </Box>
                {[
                  ['Experian Report', row.experian],
                  ['CRIF Report', row.crif],
                  ['Equifax Report', row.equifax],
                  ['AI Report', aiTotal],
                ].map(([name, price]) => (
                  <Box key={name} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{inr0(price)}</Typography>
                  </Box>
                ))}
                <Box sx={{ flexGrow: 1 }} />
                {isCurrent ? (
                  <Button fullWidth variant="outlined" disabled sx={{ mt: 2, borderRadius: 1, fontWeight: 700, textTransform: 'none', py: 1.25 }}>
                    Your current plan
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handlePlanButton(p.key)}
                      sx={{ mt: 2, borderRadius: 1, fontWeight: 700, textTransform: 'none', py: 1.25, borderColor: '#3730A3', color: '#3730A3' }}
                    >
                      {`Top up ${inr0(range.min)}+ for ${p.label}`}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setConfirmPlan(p.key)}
                      sx={{ mt: 0.5, textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary' }}
                    >
                      or select {p.label} now — free
                    </Button>
                  </>
                )}
              </Paper>
            </Grid>
          );
        })}

        {/* How plans work */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, bgcolor: '#EEF2FF', border: '1px solid #E0E7FF', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>How plans work</Typography>
            {[
              'Add money to your wallet on the Top-up tab — the full amount is credited.',
              'Select any plan your balance covers. It\u2019s free, and you can switch up or down anytime.',
              'Every report is charged at your plan\u2019s rates. Nothing else ever leaves your wallet.',
            ].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.25, mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: '#3730A3', fontSize: '0.9rem' }}>{i + 1}</Typography>
                <Typography variant="body2" sx={{ color: '#33415C', fontSize: '0.85rem' }}>{text}</Typography>
              </Box>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Button
              onClick={() => goTopUp()}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#3730A3', justifyContent: 'flex-start', p: 0, minWidth: 0 }}
            >
              Go to Wallet &amp; Top-up →
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
        Failed pulls: CIBIL charged per your plan · others {inr0(otherFail)} · matched-input CIBIL retries free. Your full top-up goes to your wallet and is spent at your plan&apos;s rates.
      </Typography>

      {/* Forced plan lock: blocks the page until a plan is selected.
          No dismiss — activation (or Top-Up-Now round-trip) is the only exit. */}
      <Dialog
        open={forcedPick && !confirmPlan}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        onClose={() => {}}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Choose your plan to continue</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Your top-up is in your wallet. Pick the plan its pulls will bill at — this step is required before continuing. Plans are free; only the balance threshold applies.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PLAN_META.map((p) => {
              const threshold = Number(plans?.[p.key]?.recharge || 0);
              const balance = Number(user?.walletBalance || 0);
              const ok = balance >= threshold;
              const isCurrent = user?.activePlan === p.key;
              return (
                <Box
                  key={p.key}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 1.5,
                    border: '1px solid', borderColor: isCurrent ? '#3730A3' : '#E2E8F0',
                    borderRadius: 1, bgcolor: isCurrent ? '#F5F3FF' : '#fff',
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {p.label}
                      {isCurrent && (
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>
                          · CURRENT
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Needs {inr0(threshold)} balance · CIBIL {inr0(plans?.[p.key]?.cibil)} / pull
                    </Typography>
                  </Box>
                  {isCurrent ? (
                    <Button size="small" variant="contained" disableElevation disabled={paying} onClick={() => handleActivate(p.key)} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#059669', whiteSpace: 'nowrap' }}>
                      {paying ? '…' : 'Keep Plan'}
                    </Button>
                  ) : ok ? (
                    <Button size="small" variant="contained" disableElevation disabled={paying} onClick={() => handleActivate(p.key)} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3', whiteSpace: 'nowrap' }}>
                      {paying ? '…' : 'Select'}
                    </Button>
                  ) : (
                    <Button
                      size="small" variant="outlined"
                      onClick={() => {
                        const need = Math.max(0, Math.ceil((threshold - balance) * 100) / 100);
                        navigate(`/partner/add-funds?amount=${need}&forPlan=${encodeURIComponent(p.label)}`);
                      }}
                      sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      Top up {inr0(threshold - balance)} more
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Selection confirm dialog */}
      <Dialog open={Boolean(confirmPlan)} onClose={() => !paying && setConfirmPlan(null)} maxWidth="xs" fullWidth>
        {confirmPlan && (() => {
          const row = plans[confirmPlan] || {};
          const threshold = Number(row.recharge) || 0;
          const balance = Number(user?.walletBalance || 0);
          const short = balance < threshold;
          return (
            <>
              <DialogTitle sx={{ fontWeight: 800 }}>Select the {planLabel(confirmPlan)} plan?</DialogTitle>
              <DialogContent dividers>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Required balance (not charged)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{threshold.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Wallet balance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Deducted for the plan</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0E9F6E' }}>
                    ₹0 — free
                  </Typography>
                </Box>
                {short && (
                  <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 1 }}>
                    Short by ₹{(threshold - balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} — top up first, then select. Plans themselves are always free.
                  </Alert>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={() => setConfirmPlan(null)} color="inherit" disabled={paying}>Cancel</Button>
                {short ? (
                  <Button
                    variant="contained" disableElevation
                    onClick={() => {
                      const need = Math.max(0, Math.ceil((threshold - balance) * 100) / 100);
                      const key = confirmPlan;
                      setConfirmPlan(null);
                      navigate(`/partner/add-funds?amount=${need}&forPlan=${encodeURIComponent(planLabel(key))}`);
                    }}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3' }}
                  >
                    Top Up Now
                  </Button>
                ) : (
                  <Button
                    variant="contained" disableElevation disabled={paying}
                    onClick={() => handleActivate(confirmPlan)}
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3' }}
                  >
                    {paying ? 'Processing…' : 'Confirm & Select — Free'}
                  </Button>
                )}
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default Plans;
