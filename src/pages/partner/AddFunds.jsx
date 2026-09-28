import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import useAuth from '../../context/useAuth';
import axios from 'axios';

// Founder price table - used instantly, then refreshed from the public
// pricing API so the page never drifts from backend truth.
const FALLBACK_PLANS = {
  startup: { recharge: 200, cibil: 120, experian: 95, crif: 95, equifax: 85, cibilFailed: 90 },
  starter: { recharge: 1000, cibil: 110, experian: 85, crif: 85, equifax: 80, cibilFailed: 80 },
  growth: { recharge: 5000, cibil: 90, experian: 65, crif: 65, equifax: 60, cibilFailed: 70 },
  pro: { recharge: 10000, cibil: 80, experian: 50, crif: 55, equifax: 50, cibilFailed: 60 },
  enterprise: { recharge: 25000, cibil: 65, experian: 35, crif: 45, equifax: 40, cibilFailed: 50 },
};
const PLAN_META = [
  { key: 'startup', label: 'Start-Up', tagline: 'First top-up' },
  { key: 'starter', label: 'Starter', tagline: 'Try it out' },
  { key: 'growth', label: 'Growth', tagline: 'Most popular', highlight: true },
  { key: 'pro', label: 'Pro', tagline: 'High volume' },
  { key: 'enterprise', label: 'Enterprise', tagline: 'Best value' },
];
const planLabel = (key) => (PLAN_META.find((p) => p.key === key)?.label || key);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const inr0 = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const inr2 = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const AddFunds = () => {
  const { user, token, login } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [aiTotal, setAiTotal] = useState(118);
  const [otherFail, setOtherFail] = useState(30);
  const [minRecharge, setMinRecharge] = useState(200);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [amount, setAmount] = useState('5000');
  const [amountError, setAmountError] = useState('');
  // First funding ever -> plan auto-assigned by slab, no choice yet.
  // Detected via lastRecharge; defaults true until the check completes.
  const [firstTimer, setFirstTimer] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payBanner, setPayBanner] = useState(null); // { tone: 'success'|'error', text }
  const [confirmPlan, setConfirmPlan] = useState(null); // plan key awaiting purchase confirm

  const parsedAmount = parseFloat(amount) || 0;

  // Live prices (public endpoint) + first-funding detection
  useEffect(() => {
    axios.get(`${API_BASE_URL}/partner/pricing/plans`)
      .then(({ data }) => {
        if (data?.success) {
          if (data.data?.plans) setPlans(data.data.plans);
          if (data.data?.ai?.total != null) setAiTotal(data.data.ai.total);
          if (data.data?.otherFailedCharge != null) setOtherFail(data.data.otherFailedCharge);
          if (data.data?.minRecharge != null) setMinRecharge(data.data.minRecharge);
        }
      })
      .catch(() => { /* fallback table stays */ });
    const t = localStorage.getItem('token');
    if (t) {
      axios.get(`${API_BASE_URL}/partner/overview/summary`, { headers: { Authorization: `Bearer ${t}` } })
        .then(({ data }) => {
          if (data?.success) setFirstTimer(!data.data?.lastRecharge);
        })
        .catch(() => { /* stay in choose mode */ setFirstTimer(false); });
    } else {
      setFirstTimer(false);
    }
  }, []);

  const handlePlanSelect = (key) => {
    if (firstTimer) return;
    setSelectedPlan(key);
    setPayBanner(null);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
      setAmountError('');
    }
  };

  const handleProceed = () => {
    const amt = parseFloat(amount) || 0;
    if (amt < minRecharge) {
      setAmountError(`Minimum top-up is ₹${Number(minRecharge).toLocaleString('en-IN')}`);
      return;
    }
    setAmountError('');
    setPayBanner(null);
    // Pure wallet top-up (no plan attached) — gateway is the only way to add funds
    handleGatewayPay(amt);
  };

  // Activate a plan from wallet balance (no Razorpay). Top up first, then activate.
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
        setPayBanner({
          tone: 'success',
          text: `${planLabel(data.activePlan)} plan activated · fee ₹${Number(data.planFee).toLocaleString('en-IN')} deducted from wallet. New balance ₹${Number(data.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`,
        });
      } else {
        setPayBanner({ tone: 'error', text: data?.message || 'Could not activate plan.' });
      }
    } catch (err) {
      console.error('Plan activation error:', err);
      setPayBanner({ tone: 'error', text: err?.response?.data?.message || 'Could not activate plan.' });
    } finally {
      setPaying(false);
    }
  };

  const handleGatewayPay = async (amt) => {
    try {
      setPaying(true);
      setConfirmPlan(null);
      const sdkOk = await loadRazorpayScript();
      if (!sdkOk || !window.Razorpay) {
        setPayBanner({ tone: 'error', text: 'Payment gateway failed to load. Check your connection and retry.' });
        setPaying(false);
        return;
      }
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const { data } = await axios.post(
        `${API_BASE_URL}/wallet-recharge/payment`,
        { amount: amt },
        { headers },
      );
      if (!data?.success || !data?.orderId || !data?.keyId) {
        setPayBanner({ tone: 'error', text: data?.message || 'Could not start payment. Please retry.' });
        setPaying(false);
        return;
      }
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'VerifyHub',
        description: `Wallet recharge ₹${Number(amt).toLocaleString('en-IN')}`,
        prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: '#3730A3' },
        handler: async (resp) => {
          try {
            const verifyRes = await axios.post(`${API_BASE_URL}/verify/payment`, {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }, { headers });
            if (verifyRes.data?.success) {
              const newBalance = verifyRes.data.walletBalance;
              const newPlan = verifyRes.data.activePlan;
              if (user && token && newBalance != null) {
                login({ ...user, walletBalance: newBalance, activePlan: newPlan || user.activePlan }, token);
              }
              const fee = verifyRes.data.planFee;
              const credited = verifyRes.data.credited;
              setPayBanner({
                tone: 'success',
                text: `₹${Number(amt).toLocaleString('en-IN')} added to wallet${verifyRes.data.plan ? ` · ${planLabel(verifyRes.data.plan)} plan active (fee ₹${Number(fee).toLocaleString('en-IN')})` : ''}. New balance ₹${Number(newBalance ?? amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`,
              });
              if (verifyRes.data.autoAssigned) setFirstTimer(false);
            } else {
              setPayBanner({ tone: 'error', text: verifyRes.data?.message || 'Payment verification failed.' });
            }
          } catch (err) {
            console.error('Verify payment error:', err);
            setPayBanner({ tone: 'error', text: err?.response?.data?.message || 'Payment verification failed.' });
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.on('payment.failed', () => setPaying(false));
      rzp.open();
    } catch (err) {
      console.error('Gateway payment error:', err);
      setPayBanner({ tone: 'error', text: err?.response?.data?.message || 'Could not start payment. Please retry.' });
      setPaying(false);
    }
  };

  const gst = Math.round(parsedAmount * 0.18 * 100) / 100;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          Plans
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
            Top up once, pay less per report. Bigger plans unlock cheaper pulls.
          </Typography>
          {user?.activePlan && (
            <Chip
              label={`Current: ${planLabel(user.activePlan)}`}
              size="small"
              sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }}
            />
          )}
        </Box>
      </Box>

      {/* Two-column layout */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Left Column: Plans + Amount */}
        <Grid size={{ xs: 12, md: 8, lg: 7 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(15,27,45,.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 0.5, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}
              >
                Choose your plan
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                AI analysis ₹{aiTotal} on all plans · pulls deduct per-report at your plan&apos;s rates
              </Typography>

              {/* Plan Cards */}
              {firstTimer && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  First top-up auto-activates the matching plan — enter any amount ₹{minRecharge} or more below.
                </Alert>
              )}
              <Grid container spacing={1.5} sx={{ mb: 2, pt: 1 }}>
                {PLAN_META.map((p) => {
                  const row = plans[p.key] || {};
                  const isSelected = selectedPlan === p.key;
                  const isCurrent = user?.activePlan === p.key;
                  const pulls = row.cibil > 0 ? Math.floor(row.recharge / row.cibil) : 0;
                  const disabled = firstTimer;
                  return (
                    <Grid size={{ xs: 6, md: 4 }} key={p.key}>
                      <Paper
                        onClick={() => handlePlanSelect(p.key)}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: isSelected && !disabled ? '#3730A3' : '#E2E8F0',
                          bgcolor: isSelected && !disabled ? '#EEF2FF' : disabled ? '#F8FAFC' : '#fff',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.75 : 1,
                          position: 'relative',
                          transition: 'all 0.18s ease',
                          '&:hover': { borderColor: '#3730A3' },
                        }}
                      >
                        {p.highlight && (
                          <Chip
                            label="Most popular"
                            size="small"
                            sx={{ position: 'absolute', top: -11, right: 8, bgcolor: '#3730A3', color: '#fff', fontSize: '0.62rem', fontWeight: 700 }}
                          />
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.label}</Typography>
                          {isCurrent && (
                            <Chip label="Current" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontSize: '0.62rem', fontWeight: 700, height: 20 }} />
                          )}
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, my: 0.5 }}>
                          ₹{Number(row.recharge || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                          {p.tagline} · ≈ {pulls} CIBIL pulls
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        {[
                          ['CIBIL', row.cibil],
                          ['Experian', row.experian],
                          ['CRIF', row.crif],
                          ['Equifax', row.equifax],
                        ].map(([name, price]) => (
                          <Box key={name} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{name}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{price}</Typography>
                          </Box>
                        ))}
                        <Button
                          fullWidth
                          size="small"
                          variant={isSelected && !disabled && !isCurrent ? 'contained' : 'outlined'}
                          disableElevation
                          disabled={disabled || isCurrent}
                          onClick={(e) => { e.stopPropagation(); setConfirmPlan(p.key); }}
                          sx={{
                            mt: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none',
                            ...(isSelected && !disabled && !isCurrent
                              ? { bgcolor: '#3730A3', '&:hover': { bgcolor: '#312E81' } }
                              : { borderColor: '#C7D2FE', color: '#3730A3' }),
                          }}
                        >
                          {isCurrent ? 'Active plan' : `Recharge ₹${Number(row.recharge || 0).toLocaleString('en-IN')}`}
                        </Button>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Failed pulls: CIBIL ₹{plans[selectedPlan]?.cibilFailed} on {planLabel(selectedPlan)} · others ₹{otherFail} · matched-input CIBIL retries free
              </Typography>

              {/* Top-up amount — lands fully in wallet; plans activate separately */}
              <TextField
                fullWidth
                label="Top-up amount (₹)"
                value={amount}
                onChange={handleAmountChange}
                error={!!amountError}
                helperText={amountError || undefined}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '1.1rem' }}>
                          ₹
                        </Typography>
                      </InputAdornment>
                    ),
                    sx: { fontSize: '1.15rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' },
                  },
                  formHelperText: {
                    sx: { color: amountError ? 'error.main' : 'text.secondary', mt: 0.75 },
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              {/* Gateway is the only way to add funds — no method choice */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, textAlign: 'center' }}>
                Secured via Razorpay · Cards · Net banking · UPI · Wallets
              </Typography>

              {/* Status banner */}
              {payBanner && (
                <Alert
                  severity={payBanner.tone}
                  onClose={() => setPayBanner(null)}
                  sx={{ mb: 2, borderRadius: '10px' }}
                >
                  {payBanner.text}
                </Alert>
              )}

              {/* CTA Button */}
              <Button
                fullWidth
                size="large"
                onClick={handleProceed}
                disabled={paying}
                sx={{
                  background: '#3730A3',
                  color: '#fff',
                  py: 1.75,
                  borderRadius: '10px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  boxShadow: '0 4px 16px rgba(55,48,163,.35)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: '#312E81',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(55,48,163,.45)',
                  },
                }}
              >
                {paying
                  ? 'Processing payment…'
                  : `Add ₹${Number(parsedAmount).toLocaleString('en-IN')}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Order Summary */}
        <Grid size={{ xs: 12, md: 4, lg: 5 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(15,27,45,.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}
              >
                Order Summary
              </Typography>
              {!firstTimer && user?.activePlan && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Active plan</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {planLabel(user.activePlan)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Wallet credit</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>+{inr2(parsedAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>GST (18%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{inr2(gst)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total payable</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {inr2(parsedAmount + gst)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                {firstTimer
                  ? 'Plan auto-activates by amount on your first top-up.'
                  : 'Full amount lands in your wallet. Activate or upgrade plans from the cards.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Plan activation confirm dialog — deducts from wallet, no Razorpay */}
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
                <Button
                  variant="contained" disableElevation disabled={paying || short}
                  onClick={() => handleActivate(confirmPlan)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3' }}
                >
                  {paying ? 'Processing…' : 'Confirm & Activate'}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default AddFunds;
