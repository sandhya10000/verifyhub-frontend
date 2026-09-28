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
} from '@mui/material';
import {
  QrCode2,
  Info,
  CreditCard,
  CheckCircle,
} from '@mui/icons-material';
import useAuth from '../../context/useAuth';
import axios from 'axios';

// Founder price table — used instantly, then refreshed from the public
// pricing API so the page never drifts from backend truth.
const FALLBACK_PLANS = {
  starter: { recharge: 1000, cibil: 110, experian: 85, crif: 85, equifax: 80, cibilFailed: 80 },
  growth: { recharge: 5000, cibil: 90, experian: 65, crif: 65, equifax: 60, cibilFailed: 70 },
  pro: { recharge: 10000, cibil: 80, experian: 50, crif: 55, equifax: 50, cibilFailed: 60 },
  enterprise: { recharge: 25000, cibil: 65, experian: 35, crif: 45, equifax: 40, cibilFailed: 50 },
};
const PLAN_META = [
  { key: 'starter', label: 'Starter', tagline: 'Try it out' },
  { key: 'growth', label: 'Growth', tagline: 'Most popular', highlight: true },
  { key: 'pro', label: 'Pro', tagline: 'High volume' },
  { key: 'enterprise', label: 'Enterprise', tagline: 'Best value' },
];
const planLabel = (key) => (PLAN_META.find((p) => p.key === key)?.label || key);
const UPI_ID = 'payments@verifyhub';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const AddFunds = () => {
  const { user, token, login } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [aiTotal, setAiTotal] = useState(118);
  const [otherFail, setOtherFail] = useState(30);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [activeMethod, setActiveMethod] = useState('upi');
  const [qrReady, setQrReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payBanner, setPayBanner] = useState(null); // { tone: 'success'|'error', text }

  const planAmount = plans[selectedPlan]?.recharge || 0;

  // Live prices (public endpoint) — silent fallback to the founder table
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

  const handlePlanSelect = (key) => {
    setSelectedPlan(key);
    setQrReady(false);
    setPayBanner(null);
  };

  const handleProceed = () => {
    setPayBanner(null);
    if (activeMethod === 'upi') {
      setQrReady(true);
    } else {
      handleGatewayPay(planAmount);
    }
  };

  const handleGatewayPay = async (amt) => {
    try {
      setPaying(true);
      const sdkOk = await loadRazorpayScript();
      if (!sdkOk || !window.Razorpay) {
        setPayBanner({ tone: 'error', text: 'Payment gateway failed to load. Check your connection and retry.' });
        return;
      }
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const { data } = await axios.post(`${API_BASE_URL}/wallet-recharge/payment`, { amount: amt }, { headers });
      if (!data?.success || !data?.orderId || !data?.keyId) {
        setPayBanner({ tone: 'error', text: data?.message || 'Could not start payment. Please retry.' });
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
              setPayBanner({
                tone: 'success',
                text: `₹${Number(amt).toLocaleString('en-IN')} added. New balance ₹${Number(newBalance ?? amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}${newPlan ? ` · ${planLabel(newPlan)} plan active` : ''}.`,
              });
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

  const formatINR = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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
        {/* Left Column: Recharge Amount */}
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
              <Grid container spacing={1.5} sx={{ mb: 2, pt: 1 }}>
                {PLAN_META.map((p) => {
                  const row = plans[p.key] || {};
                  const isSelected = selectedPlan === p.key;
                  const isCurrent = user?.activePlan === p.key;
                  const pulls = row.cibil > 0 ? Math.floor(row.recharge / row.cibil) : 0;
                  return (
                    <Grid size={{ xs: 6 }} key={p.key}>
                      <Paper
                        onClick={() => handlePlanSelect(p.key)}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: isSelected ? '#3730A3' : '#E2E8F0',
                          bgcolor: isSelected ? '#EEF2FF' : '#fff',
                          cursor: 'pointer',
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
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
                Failed pulls: CIBIL ₹{plans[selectedPlan]?.cibilFailed} on {planLabel(selectedPlan)} · others ₹{otherFail} · matched-input CIBIL retries free
              </Typography>

              {/* Payment Method Tiles */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  {
                    id: 'upi',
                    icon: <QrCode2 sx={{ fontSize: 22 }} />,
                    title: 'UPI / QR Code',
                    sub: 'Scan & pay — instant credit',
                  },
                  {
                    id: 'gateway',
                    icon: <CreditCard sx={{ fontSize: 22 }} />,
                    title: 'Payment Gateway',
                    sub: 'Cards · Net banking · Wallets',
                  },
                ].map((method) => {
                  const isActive = activeMethod === method.id;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={method.id}>
                      <Paper
                        onClick={() => setActiveMethod(method.id)}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: isActive ? '#3730A3' : '#E2E8F0',
                          bgcolor: isActive ? '#EEF2FF' : '#FAFAFA',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.18s ease',
                          '&:hover': { borderColor: '#3730A3', bgcolor: '#EEF2FF' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '8px',
                            bgcolor: isActive ? '#C7D2FE' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: isActive ? '#3730A3' : '#64748B',
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                            {method.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {method.sub}
                          </Typography>
                        </Box>
                        {isActive && <CheckCircle sx={{ color: '#3730A3', fontSize: 18 }} />}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

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
                  : `Buy ${planLabel(selectedPlan)} — Pay ₹${Number(planAmount).toLocaleString('en-IN')}`}
              </Button>
              {activeMethod === 'upi' && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.25, textAlign: 'center' }}>
                  UPI top-ups credit after manual verification and don&apos;t auto-activate plan rates.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Pay via UPI QR */}
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
                sx={{ fontWeight: 700, mb: 2.5, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}
              >
                Pay via UPI QR
              </Typography>

              {/* QR Code Box */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxWidth: 240,
                  mx: 'auto',
                  mb: 2.5,
                  borderRadius: '12px',
                  border: '2px dashed',
                  borderColor: qrReady ? '#3730A3' : '#CBD5E1',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#F8FAFC',
                  transition: 'border-color 0.3s ease',
                }}
              >
                {qrReady ? (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block' }}
                    >
                      <rect width="200" height="200" fill="#fff" />
                      {/* Top-left position marker */}
                      <rect x="10" y="10" width="50" height="50" rx="4" fill="#0A1628" />
                      <rect x="18" y="18" width="34" height="34" rx="2" fill="#fff" />
                      <rect x="24" y="24" width="22" height="22" rx="2" fill="#0A1628" />
                      {/* Top-right position marker */}
                      <rect x="140" y="10" width="50" height="50" rx="4" fill="#0A1628" />
                      <rect x="148" y="18" width="34" height="34" rx="2" fill="#fff" />
                      <rect x="154" y="24" width="22" height="22" rx="2" fill="#0A1628" />
                      {/* Bottom-left position marker */}
                      <rect x="10" y="140" width="50" height="50" rx="4" fill="#0A1628" />
                      <rect x="18" y="148" width="34" height="34" rx="2" fill="#fff" />
                      <rect x="24" y="154" width="22" height="22" rx="2" fill="#0A1628" />
                      {/* Data modules */}
                      {[
                        [70,70],[80,70],[90,70],[110,70],[130,70],
                        [70,80],[100,80],[120,80],[130,80],
                        [80,90],[90,90],[110,90],[120,90],
                        [70,100],[90,100],[100,100],[110,100],[130,100],
                        [80,110],[90,110],[120,110],[130,110],
                        [70,120],[100,120],[110,120],
                        [80,130],[90,130],[110,130],[120,130],[130,130],
                      ].map(([x, y], i) => (
                        <rect key={i} x={x} y={y} width="8" height="8" fill="#0A1628" rx="1" />
                      ))}
                      {/* Green center logo circle */}
                      <circle cx="100" cy="100" r="14" fill="#fff" />
                      <circle cx="100" cy="100" r="10" fill="#3730A3" />
                      <text x="100" y="104" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">V</text>
                    </svg>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#3730A3', fontWeight: 700, fontSize: '0.8rem' }}>
                        ₹{formatINR(String(planAmount))} · {planLabel(selectedPlan)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(9, 1fr)',
                        gap: '3px',
                        mb: 1.5,
                        opacity: 0.2,
                        mx: 'auto',
                        width: 'fit-content',
                      }}
                    >
                      {[...Array(81)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 10,
                            height: 10,
                            bgcolor: (i + Math.floor(i / 9)) % 2 === 0 ? '#0A1628' : 'transparent',
                            borderRadius: '1px',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.72rem', lineHeight: 1.5, display: 'block' }}
                    >
                      UPI QR renders here after
                      <br />
                      amount is confirmed
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* UPI ID row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#F8FAFC',
                  borderRadius: '8px',
                  px: 2,
                  py: 1.25,
                  mb: 2,
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    UPI ID
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", "Roboto Mono", monospace' }}
                  >
                    {UPI_ID}
                  </Typography>
                </Box>
                <Chip
                  label="Copy"
                  size="small"
                  onClick={() => navigator.clipboard?.writeText(UPI_ID)}
                  sx={{
                    bgcolor: '#EEF2FF',
                    color: '#3730A3',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#C7D2FE' },
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Partner ID callout */}
              <Alert
                icon={<Info sx={{ fontSize: 18 }} />}
                severity="warning"
                sx={{
                  bgcolor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  '& .MuiAlert-icon': { color: '#D97706', alignItems: 'flex-start', pt: 0.5 },
                  '& .MuiAlert-message': { lineHeight: 1.5 },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400E' }}>
                  Add your Partner ID{' '}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 800,
                      fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
                      bgcolor: '#FEF3C7',
                      px: 0.75,
                      py: 0.15,
                      borderRadius: '4px',
                    }}
                  >
                    {user?.partnerId || user?.id || user?._id || 'Pending'}
                  </Box>{' '}
                  in the payment note so credit is matched automatically.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddFunds;
