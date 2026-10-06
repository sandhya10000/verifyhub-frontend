import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import axios from 'axios';
import {
  FALLBACK_PLANS, inr0, inr2,
  SINGLE_PLAN_KEY,
} from './planConfig';

// Separate Pricing tab (single-plan launch): read-only rate card for ALL
// products. No plan selection — the single plan auto-applies to everyone.
// Served at /partner/pricing (legacy /partner/plans redirects here).
// TODO(multi-plan-restore): re-add plan selection UI (see git history).

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FALLBACK_AI = { base: 100, gstRate: 18, total: 118 };
const FALLBACK_RC = { base: 10, gstRate: 0, total: 10 };
const FALLBACK_GST = { base: 10, gstRate: 0, total: 10 };

const Plans = () => {
  const navigate = useNavigate();
  // Pricing is hidden from first-time partners until their first top-up —
  // direct visits bounce to Add Funds (funded partners always pass).
  const { user, refreshWallet, hasToppedUp, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && hasToppedUp === false) navigate('/partner/add-funds', { replace: true });
  }, [isLoading, hasToppedUp, navigate]);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [ai, setAi] = useState(FALLBACK_AI);
  const [rc, setRc] = useState(FALLBACK_RC);
  const [gst, setGst] = useState(FALLBACK_GST);
  // Single-plan launch: AI failure is flat ₹100 (no GST).
  // TODO(multi-plan-restore): drop aiFail, fall back to otherFailedCharge.
  const [aiFail, setAiFail] = useState(100);
  const [minRecharge, setMinRecharge] = useState(1000);

  useEffect(() => {
    // Refresh balance (stored login payload may predate it).
    refreshWallet?.();
    axios.get(`${API_BASE_URL}/partner/pricing/plans`)
      .then(({ data }) => {
        if (data?.success) {
          if (data.data?.plans) setPlans(data.data.plans);
          if (data.data?.ai) setAi(data.data.ai);
          if (data.data?.rc) setRc(data.data.rc);
          if (data.data?.gst) setGst(data.data.gst);
          if (data.data?.aiFail?.total != null) setAiFail(data.data.aiFail.total);
          if (data.data?.minRecharge != null) setMinRecharge(data.data.minRecharge);
        }
      })
      .catch(() => { /* fallback prices stay */ });
  }, []);

  const goTopUp = () => navigate('/partner/add-funds');

  const row = plans[SINGLE_PLAN_KEY] || {};
  const bureaus = [
    { key: 'cibil', label: 'CIBIL', desc: 'Credit report' },
    { key: 'experian', label: 'Experian', desc: 'Credit report' },
    { key: 'crif', label: 'CRIF', desc: 'Credit report' },
    { key: 'equifax', label: 'Equifax', desc: 'Credit report' },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
            Pricing
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Single plan for everyone — no selection needed. Only generated reports are charged.
          </Typography>
        </Box>
        <Button
          variant="contained" disableElevation
          onClick={goTopUp}
          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3', whiteSpace: 'nowrap', px: 2.5, py: 1 }}
        >
          Top up wallet
        </Button>
      </Box>

      {/* Status strip */}
      <Paper elevation={0} sx={{ border: '1px solid #E8EEF5', borderRadius: 1, px: 3, py: 2, mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Wallet balance</Typography>
          <Typography sx={{ fontWeight: 800 }}>{user?.walletBalance != null ? inr2(user.walletBalance) : '—'}</Typography>
        </Box>
        <Box sx={{ minWidth: 140 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Minimum top-up</Typography>
          <Typography sx={{ fontWeight: 800 }}>{inr0(minRecharge)}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200, textAlign: { xs: 'left', md: 'right' } }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Bureau + RC/GST fails bill the same as success · AI fail ₹100 flat.</Typography>
        </Box>
      </Paper>

      {/* Bureau prices */}
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Credit bureau reports</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {bureaus.map((b) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={b.key}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 1, border: '1px solid #E8EEF5', bgcolor: '#fff', height: '100%' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{b.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{b.desc}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>
                {inr0(row[b.key])}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>per report · success or fail</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* AI + RC + GST prices */}
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>AI analysis &amp; verifications</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, border: '1px solid #E8EEF5', bgcolor: '#fff', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>AI analysis</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Credit report analyzer</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{inr0(ai.total)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              per analysis · fail {inr0(aiFail)} flat
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, border: '1px solid #E8EEF5', bgcolor: '#fff', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Vehicle RC</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>RC verification</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{inr0(rc.total)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>per verification · success or fail</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, border: '1px solid #E8EEF5', bgcolor: '#fff', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>GST</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>GST verification</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{inr0(gst.total)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>per verification · success or fail</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
        Your full top-up goes to your wallet and is spent at these rates. Prices apply to new pulls only.
      </Typography>
    </Box>
  );
};

export default Plans;
