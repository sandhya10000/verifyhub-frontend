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
  InputAdornment,
  Divider,
} from '@mui/material';
import { CurrencyRupee } from '@mui/icons-material';
import useAuth from '../../context/useAuth';
import axios from 'axios';
import { planLabel } from './planConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const inr2 = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const AddFunds = () => {
  const { user, token, login } = useAuth();
  // Single-plan launch mode: floor is ₹1,000 (server-enforced via Pricing.minRecharge).
  // No forced plan pick — single plan auto-applies on every recharge.
  // TODO(multi-plan-restore): restore default floor 200 + plan-pick redirect.
  const [minRecharge, setMinRecharge] = useState(1000);
  const [amount, setAmount] = useState(() => {
    // Pre-fill when arriving from Plans ("Top up ₹X+ for Y").
    try {
      const q = new URLSearchParams(window.location.search).get('amount');
      if (q && /^\d+(\.\d{1,2})?$/.test(q) && Number(q) > 0) return q;
    } catch { /* ignore */ }
    return '1000';
  });
  const [amountError, setAmountError] = useState('');
  // First funding ever -> plan auto-assigned by slab on the backend.
  const [firstTimer, setFirstTimer] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payBanner, setPayBanner] = useState(null); // { tone: 'success'|'error', text }
  // Shortfall notice when arriving with a prefilled amount.
  // (Legacy ?forPlan= param is ignored — no plan selection in single-plan mode.)
  const [forPlanNotice, setForPlanNotice] = useState('');
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const amt = q.get('amount');
      if (amt && Number(amt) > 0) {
        setForPlanNotice(`Top up ${inr2(Number(amt))} or more — the single plan applies automatically. See Pricing for all rates.`);
      }
    } catch { /* ignore */ }
  }, []);

  const parsedAmount = parseFloat(amount) || 0;

  useEffect(() => {
    axios.get(`${API_BASE_URL}/partner/pricing/plans`)
      .then(({ data }) => {
        if (data?.success && data.data?.minRecharge != null) setMinRecharge(data.data.minRecharge);
      })
      .catch(() => { /* default floor stays */ });
    const t = localStorage.getItem('token');
    if (t) {
      axios.get(`${API_BASE_URL}/partner/overview/summary`, { headers: { Authorization: `Bearer ${t}` } })
        .then(({ data }) => {
          if (data?.success) setFirstTimer(!data.data?.lastRecharge);
        })
        .catch(() => setFirstTimer(false));
    } else {
      setFirstTimer(false);
    }
  }, []);

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
    // Gateway is the only way to add funds — pure wallet top-up, no plan attached
    handleGatewayPay(amt);
  };

  const handleGatewayPay = async (amt) => {
    try {
      setPaying(true);
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
        name: 'Verify Hub',
        description: `Wallet recharge ₹${Number(amt).toLocaleString('en-IN')}`,
        // Absolute platform logo for the checkout header (public/Logo.jpeg —
        // stable path; Razorpay requires an absolute URL, so derive the
        // deployed origin at runtime). Overrides any dashboard brand logo.
        image: `${window.location.origin}/Logo.jpeg`,
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
              // Single-plan mode: no plan pick — recharge lands on the single
              // plan automatically. TODO(multi-plan-restore): restore needsPlan redirect.
              if (user && token && newBalance != null) {
                login({ ...user, walletBalance: newBalance, activePlan: newPlan || user.activePlan, pendingPlanChoice: false }, token);
              }
              setPayBanner({
                tone: 'success',
                text: `₹${Number(amt).toLocaleString('en-IN')} added to wallet${verifyRes.data.plan ? ` · ${planLabel(verifyRes.data.plan)} plan active` : ''}. New balance ${inr2(newBalance ?? amt)}.`,
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

  const agentCode = user?.partner_id || user?.partnerId || user?.id || user?._id || '—';

  return (
    <Box>
      {/* Professional header */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          mb: 3,
          background: 'linear-gradient(135deg, #F4F1FF 0%, #EEF2FF 55%, #ECFDF5 100%)',
          boxShadow: '0 2px 12px rgba(15,27,45,.06)',
        }}
      >
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: 'text.primary', mb: 0.5 }}
            >
              Add Funds
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Agent: {user?.name || 'Partner'} · Code: {agentCode}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
              {user?.activePlan && (
                <Chip label={`Plan: ${planLabel(user.activePlan)}`} size="small" sx={{ bgcolor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }} />
              )}
              {user?.walletBalance != null && (
                <Chip label={`Wallet: ${inr2(user.walletBalance)}`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
              )}
            </Box>
          </Box>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
              bgcolor: 'rgba(79,70,229,0.1)', color: '#4F46E5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CurrencyRupee sx={{ fontSize: 32 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Left: amount + pay */}
        <Grid size={{ xs: 12, md: 8, lg: 7 }}>
          <Card
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', boxShadow: '0 2px 12px rgba(15,27,45,.06)' }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                Top up your wallet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                Full amount lands in your wallet. The single plan applies automatically — only generated reports are charged. See Pricing for all rates.
              </Typography>

              {firstTimer && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  Your first top-up of ₹1,000+ activates the single launch plan automatically — free, full amount credited.
                </Alert>
              )}

              {forPlanNotice && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  {forPlanNotice}
                </Alert>
              )}

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

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, textAlign: 'center' }}>
                Secured via Razorpay · Cards · Net banking · UPI · Wallets
              </Typography>

              {payBanner && (
                <Alert severity={payBanner.tone} onClose={() => setPayBanner(null)} sx={{ mb: 2, borderRadius: '10px' }}>
                  {payBanner.text}
                </Alert>
              )}

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
                {paying ? 'Processing payment…' : `Add ₹${Number(parsedAmount).toLocaleString('en-IN')}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: order summary */}
        <Grid size={{ xs: 12, md: 4, lg: 5 }}>
          <Card
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', boxShadow: '0 2px 12px rgba(15,27,45,.06)' }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Wallet credit</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>+{inr2(parsedAmount)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total payable</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{inr2(parsedAmount)}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                GST-inclusive — no extra tax at checkout.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                {firstTimer
                  ? 'The single launch plan is assigned free on your first ₹1,000+ top-up.'
                  : 'Full amount lands in your wallet. See Pricing for all rates.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddFunds;
