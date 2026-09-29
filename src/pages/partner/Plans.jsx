import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Grid,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CurrencyRupee,
  AccountBalanceWallet,
  GridView,
  CardMembership,
  ReceiptLong,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import axios from 'axios';
import { FALLBACK_PLANS, PLAN_META, planLabel, inr2 } from './planConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GUIDE_STEPS = [
  { icon: <CurrencyRupee sx={{ fontSize: 26 }} />, title: 'Step 1', text: 'Add fund using Razorpay', bg: '#EEF2FF', fg: '#4F46E5' },
  { icon: <AccountBalanceWallet sx={{ fontSize: 26 }} />, title: 'Step 2', text: 'Money added to Main Wallet', bg: '#EFF6FF', fg: '#2563EB' },
  { icon: <GridView sx={{ fontSize: 26 }} />, title: 'Step 3', text: 'Choose a recharge plan', bg: '#FAF5FF', fg: '#9333EA' },
  { icon: <CardMembership sx={{ fontSize: 26 }} />, title: 'Step 4', text: 'Activate plan from wallet', bg: '#FFFBEB', fg: '#D97706' },
  { icon: <ReceiptLong sx={{ fontSize: 26 }} />, title: 'Step 5', text: 'Generate bureau reports', bg: '#ECFDF5', fg: '#059669' },
];

const Plans = () => {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [aiTotal, setAiTotal] = useState(118);
  const [otherFail, setOtherFail] = useState(30);
  const [banner, setBanner] = useState(null);
  const [paying, setPaying] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(null);

  useEffect(() => {
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
          login({ ...user, walletBalance: data.walletBalance, activePlan: data.activePlan }, token);
        }
        setBanner({
          tone: 'success',
          text: `${planLabel(data.activePlan)} plan activated · fee ₹${Number(data.planFee).toLocaleString('en-IN')} deducted from wallet. New balance ₹${Number(data.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`,
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: 'text.primary' }}
          >
            Recharge Plans
          </Typography>
          {user?.activePlan && (
            <Chip label={`Current: ${planLabel(user.activePlan)}`} size="small" sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }} />
          )}
          {user?.walletBalance != null && (
            <Chip
              label={`Wallet: ${inr2(user.walletBalance)}`}
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }}
            />
          )}
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1rem', mt: 0.5 }}>
          Top up your wallet, then activate a plan. Bigger plans unlock cheaper pulls.
        </Typography>
      </Box>

      {banner && (
        <Alert severity={banner.tone} onClose={() => setBanner(null)} sx={{ mb: 2.5, borderRadius: '10px' }}>
          {banner.text}
        </Alert>
      )}

      {/* Usage guide */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', boxShadow: '0 2px 12px rgba(15,27,45,.06)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
            Wallet → Report Usage Guide
          </Typography>
          <Grid container spacing={1.5}>
            {GUIDE_STEPS.map((s) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={s.title}>
                <Paper
                  elevation={0}
                  sx={{ p: 2, borderRadius: '10px', bgcolor: s.bg, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}
                >
                  <Box sx={{ color: s.fg, display: 'flex' }}>{s.icon}</Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: s.fg }}>{s.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>{s.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Plan cards */}
      <Grid container spacing={2}>
        {PLAN_META.map((p) => {
          const row = plans[p.key] || {};
          const isCurrent = user?.activePlan === p.key;
          const pulls = row.cibil > 0 ? Math.floor(row.recharge / row.cibil) : 0;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5, borderRadius: '12px', border: '2px solid',
                  borderColor: isCurrent ? '#10B981' : '#E2E8F0',
                  bgcolor: '#fff', position: 'relative', height: '100%',
                  transition: 'all 0.18s ease', '&:hover': { borderColor: '#3730A3' },
                }}
              >
                {p.highlight && (
                  <Chip label="Most popular" size="small"
                    sx={{ position: 'absolute', top: -11, right: 12, bgcolor: '#3730A3', color: '#fff', fontSize: '0.62rem', fontWeight: 700 }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{p.label}</Typography>
                  {isCurrent && (
                    <Chip label="Current" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontSize: '0.62rem', fontWeight: 700, height: 20 }} />
                  )}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>
                  ₹{Number(row.recharge || 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  {p.tagline} · ≈ {pulls} CIBIL pulls
                </Typography>
                <Divider sx={{ my: 1 }} />
                {[
                  ['CIBIL Report', row.cibil],
                  ['Experian Report', row.experian],
                  ['CRIF Report', row.crif],
                  ['Equifax Report', row.equifax],
                  ['AI Report', aiTotal],
                ].map(([name, price]) => (
                  <Box key={name} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{Number(price || 0).toLocaleString('en-IN')}</Typography>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant={isCurrent ? 'outlined' : 'contained'}
                  disableElevation
                  disabled={isCurrent}
                  onClick={() => setConfirmPlan(p.key)}
                  sx={{
                    mt: 2, borderRadius: '8px', fontWeight: 700, textTransform: 'none', py: 1.25,
                    ...(isCurrent
                      ? { borderColor: '#A7F3D0', color: '#059669' }
                      : { bgcolor: '#3730A3', '&:hover': { bgcolor: '#312E81' } }),
                  }}
                >
                  {isCurrent ? 'Active plan' : `Recharge ₹${Number(row.recharge || 0).toLocaleString('en-IN')}`}
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
        Failed pulls: CIBIL charged per your plan · others ₹{otherFail} · matched-input CIBIL retries free. Plan fee is deducted from wallet balance.
      </Typography>

      {/* Activation confirm dialog */}
      <Dialog open={Boolean(confirmPlan)} onClose={() => !paying && setConfirmPlan(null)} maxWidth="xs" fullWidth>
        {confirmPlan && (() => {
          const row = plans[confirmPlan] || {};
          const dialogFee = Number(row.recharge) || 0;
          const balance = Number(user?.walletBalance || 0);
          const short = balance < dialogFee;
          return (
            <>
              <DialogTitle sx={{ fontWeight: 800 }}>Activate the {planLabel(confirmPlan)} plan?</DialogTitle>
              <DialogContent dividers>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Plan fee (from wallet)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{dialogFee.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Wallet balance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Balance after</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: short ? 'error.main' : 'text.primary' }}>
                    ₹{(balance - dialogFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                {short && (
                  <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
                    Short by ₹{(dialogFee - balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} — top up first, then activate.
                  </Alert>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={() => setConfirmPlan(null)} color="inherit" disabled={paying}>Cancel</Button>
                {short ? (
                  <Button
                    variant="contained" disableElevation
                    onClick={() => { setConfirmPlan(null); navigate('/partner/add-funds'); }}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3' }}
                  >
                    Top Up Now
                  </Button>
                ) : (
                  <Button
                    variant="contained" disableElevation disabled={paying}
                    onClick={() => handleActivate(confirmPlan)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3' }}
                  >
                    {paying ? 'Processing…' : 'Confirm & Activate'}
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
