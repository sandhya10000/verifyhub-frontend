import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Radio,
} from '@mui/material';
import { Sparkles, Check, CheckCircle2, PhoneCall, Wallet, CreditCard } from 'lucide-react';
import useAuth from '../../context/useAuth';
import BrandedSamples from './BrandedSamples';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const tk = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderFocus: '#2563EB',
  text: { primary: '#0F172A', secondary: '#334155', muted: '#64748B' },
  success: { bg: '#DCFCE7', text: '#15803D' },
  info: { bg: '#EFF6FF', text: '#1E40AF' },
  error: '#DC2626',
};

const pillBtn = {
  bgcolor: tk.primary,
  color: '#fff',
  fontWeight: 700,
  py: 1.5,
  borderRadius: '9999px',
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
  '&:hover': { bgcolor: tk.primaryHover, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8', boxShadow: 'none' },
};

const CHECKLIST = [
  'Your logo, colours and company details',
  'Social media and contact links in header and footer',
  'Up to 2 free revision rounds',
  'Approved once, applied to all your future reports',
];

// One-time fee (₹, flat GST-inclusive). Server is the source of truth via
// GET /quote — this is the instant fallback before the quote loads.
const FALLBACK_PRICE = 2500;

const inr0 = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePhone = (v) => {
  const digits = String(v).replace(/^\+91/, '').replace(/\D/g, '');
  return digits.length === 10;
};

const fmt = (iso) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

// ---------------------------------------------------------------------------
// Field component with inline error
// ---------------------------------------------------------------------------
const Field = ({ id, label, type = 'text', value, onChange, onBlur, error, placeholder, hint, disabled }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Typography
      component="label"
      htmlFor={id}
      sx={{ fontSize: '0.8rem', fontWeight: 700, color: tk.text.secondary, letterSpacing: '0.04em' }}
    >
      {label} <Box component="span" sx={{ color: tk.error }}>*</Box>
    </Typography>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        padding: '12px 14px',
        borderRadius: 8,
        border: `1.5px solid ${error ? tk.error : tk.border}`,
        fontSize: '0.95rem',
        color: tk.text.primary,
        background: disabled ? '#F8FAFC' : '#FFFFFF',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'text',
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) => { if (!disabled) e.target.style.borderColor = error ? tk.error : tk.borderFocus; }}
    />
    {error && (
      <Typography sx={{ fontSize: '0.78rem', color: tk.error, mt: 0.25 }}>{error}</Typography>
    )}
    {hint && !error && (
      <Typography sx={{ fontSize: '0.75rem', color: tk.text.muted, mt: 0.25 }}>{hint}</Typography>
    )}
  </Box>
);

// ---------------------------------------------------------------------------
// Active-request status view
// ---------------------------------------------------------------------------
const StatusView = ({ request }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
    {/* Success banner */}
    <Box
      sx={{
        bgcolor: tk.success.bg,
        border: '1px solid #BBF7D0',
        borderRadius: 2.5,
        p: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
      }}
    >
      <CheckCircle2 size={20} color={tk.success.text} style={{ flexShrink: 0, marginTop: 2 }} />
      <Box>
        <Typography sx={{ fontWeight: 700, color: tk.success.text, fontSize: '0.95rem' }}>
          Request received!
        </Typography>
        <Typography sx={{ color: tk.success.text, fontSize: '0.85rem', mt: 0.25 }}>
          Our team will contact you within 1–2 working days to collect all customisation details.
        </Typography>
      </Box>
    </Box>

    {/* Request details */}
    <Box sx={{ bgcolor: '#F8FAFC', border: `1px solid ${tk.border}`, borderRadius: 2, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: tk.text.primary, fontSize: '0.9rem' }}>
          Request Details
        </Typography>
        <Chip
          label={request.status}
          size="small"
          sx={{ bgcolor: tk.info.bg, color: tk.info.text, fontWeight: 700, borderRadius: '9999px', fontSize: '0.75rem' }}
        />
      </Box>

      {[
        { label: 'Request ID', value: request.requestId },
        { label: 'Email', value: request.email },
        { label: 'Phone', value: request.phone?.length === 10 ? `+91 ${request.phone}` : request.phone },
        ...(request.amount != null ? [{ label: 'Amount paid', value: `${inr0(request.amount)} · ${request.paymentMethod === 'WALLET' ? 'Wallet credits' : 'Razorpay'} · Paid` }] : []),
        { label: 'Submitted on', value: fmt(request.createdAt) },
      ].map(({ label, value }) => (
        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: '0.82rem', color: tk.text.muted }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: tk.text.primary, textAlign: 'right' }}>{value}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const CustomBrandedReportPage = () => {
  const { user, login, token } = useAuth();

  // Remote state
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Price quote (server is source of truth)
  const [quote, setQuote] = useState({ price: FALLBACK_PRICE, walletBalance: user?.walletBalance ?? 0, canAffordWallet: true });
  const price = quote.price ?? FALLBACK_PRICE;

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ email: false, phone: false });
  // Step 1 = contact details, Step 2 = payment (revealed only after submit)
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);

  // Payment state (details-then-pay: contact first, then one-time fee)
  const [payMethod, setPayMethod] = useState('wallet'); // 'wallet' | 'razorpay'
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [needsRecharge, setNeedsRecharge] = useState(false);

  // ── Pre-fill from profile ──────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.phone && !phone) {
      // Strip +91 prefix if present for the editable field
      setPhone(String(user.phone).replace(/^\+91/, '').replace(/\D/g, ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Fetch current request status + price quote ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingStatus(true);
      setFetchError(null);
      try {
        const [statusRes, quoteRes] = await Promise.all([
          axios.get(`${API_BASE}/partner/custom-branded-report`, { headers: authHeader() }),
          axios.get(`${API_BASE}/partner/custom-branded-report/quote`, { headers: authHeader() }).catch(() => null),
        ]);
        setActiveRequest(statusRes.data.data || null);
        if (quoteRes?.data?.data) setQuote(quoteRes.data.data);
        // Resumable unpaid skeleton: details were already submitted, so land
        // directly on the payment step with the saved contact pre-filled.
        const existing = statusRes.data.data;
        if (existing && existing.paymentStatus !== 'Paid') {
          if (existing.email) setEmail(existing.email);
          if (existing.phone) setPhone(String(existing.phone).replace(/^\+91/, '').replace(/\D/g, ''));
          setDetailsConfirmed(true);
        }
      } catch (err) {
        console.error('[CustomBrandedReportPage] fetch error:', err);
        setFetchError('Could not load your request status. Please try again.');
      } finally {
        setLoadingStatus(false);
      }
    };
    load();
  }, []);

  // ── Derived validation ─────────────────────────────────────────────────────
  const emailErr = touched.email && !validateEmail(email) ? 'Enter a valid email address.' : '';
  const phoneErr = touched.phone && !validatePhone(phone)
    ? 'Enter a valid 10-digit Indian mobile number.'
    : '';
  const formValid = validateEmail(email) && validatePhone(phone);

  const syncWalletBalance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/partner/custom-branded-report/quote`, { headers: authHeader() });
      if (res.data?.data) setQuote(res.data.data);
      return res.data?.data;
    } catch {
      return null;
    }
  };

  // ── Wallet payment (₹2500 flat debit) ──────────────────────────────────────
  const handleWalletPay = async () => {
    setTouched({ email: true, phone: true });
    if (!formValid || paying) return;
    setPaying(true);
    setPayError(null);
    setNeedsRecharge(false);
    try {
      const res = await axios.post(
        `${API_BASE}/partner/custom-branded-report/pay/wallet`,
        { email: email.trim(), phone: phone.replace(/\D/g, '') },
        { headers: authHeader() },
      );
      setActiveRequest(res.data.data);
      if (user && token && res.data.walletBalance != null) {
        login({ ...user, walletBalance: res.data.walletBalance }, token);
        setQuote((q) => ({ ...q, walletBalance: res.data.walletBalance, canAffordWallet: res.data.walletBalance >= price }));
      } else {
        syncWalletBalance();
      }
    } catch (err) {
      if (err.response?.data?.code === 'DUPLICATE_REQUEST') {
        setActiveRequest(err.response.data.data);
      } else if (err.response?.data?.code === 'INSUFFICIENT_BALANCE') {
        const bal = err.response.data.balance ?? quote.walletBalance;
        setQuote((q) => ({ ...q, walletBalance: bal, canAffordWallet: false }));
        setNeedsRecharge(true);
        setPayError(err.response.data.message || 'Insufficient wallet balance. Please recharge.');
      } else {
        setPayError(err.response?.data?.message || 'Wallet payment failed. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  };

  // ── Razorpay payment (direct one-time fee order) ───────────────────────────
  const handleRazorpayPay = async () => {
    setTouched({ email: true, phone: true });
    if (!formValid || paying) return;
    setPaying(true);
    setPayError(null);
    setNeedsRecharge(false);
    try {
      const sdkOk = await loadRazorpayScript();
      if (!sdkOk || !window.Razorpay) {
        setPayError('Payment gateway failed to load. Check your connection and retry.');
        setPaying(false);
        return;
      }
      const headers = authHeader();
      const { data } = await axios.post(
        `${API_BASE}/partner/custom-branded-report/order`,
        { email: email.trim(), phone: phone.replace(/\D/g, '') },
        { headers },
      );
      if (data?.code === 'DUPLICATE_REQUEST') {
        setActiveRequest(data.data);
        setPaying(false);
        return;
      }
      if (!data?.orderId || !data?.keyId) {
        setPayError(data?.message || 'Could not start online payment. Please retry.');
        setPaying(false);
        return;
      }
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'Verify Hub',
        description: `Custom Branded Report one-time fee ${inr0(price)}`,
        image: `${window.location.origin}/Logo.jpeg`,
        prefill: { name: user?.name || '', email: email.trim(), contact: phone.replace(/\D/g, '') },
        theme: { color: '#2563EB' },
        handler: async (resp) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/partner/custom-branded-report/verify`,
              {
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              },
              { headers },
            );
            if (verifyRes.data?.success) {
              setActiveRequest(verifyRes.data.data);
            } else {
              setPayError(verifyRes.data?.message || 'Payment verification failed.');
            }
          } catch (err) {
            console.error('[CustomBrandedReportPage] verify error:', err);
            setPayError(err?.response?.data?.message || 'Payment verification failed. If money was debited, retry — verification is idempotent.');
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.on('payment.failed', () => setPaying(false));
      rzp.open();
    } catch (err) {
      console.error('[CustomBrandedReportPage] razorpay error:', err);
      if (err.response?.data?.code === 'DUPLICATE_REQUEST') {
        setActiveRequest(err.response.data.data);
      } else {
        setPayError(err?.response?.data?.message || 'Could not start online payment. Please retry.');
      }
      setPaying(false);
    }
  };

  // ── Step 1 submit: validate details, then reveal the payment step ─────────
  const handleDetailsSubmit = () => {
    setTouched({ email: true, phone: true });
    if (!formValid) return;
    setPayError(null);
    setNeedsRecharge(false);
    setDetailsConfirmed(true);
  };

  const handlePay = () => {
    if (payMethod === 'wallet') return handleWalletPay();
    return handleRazorpayPay();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const isPaidActive = Boolean(
    activeRequest && activeRequest.paymentStatus === 'Paid' && activeRequest.status === 'Active',
  );
  const isUnpaidSkeleton = Boolean(
    activeRequest && activeRequest.paymentStatus !== 'Paid',
  );

  return (
    <Box sx={{ pb: 8 }}>
      {/* ── Page header ── */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#EFF6FF', color: tk.primary,
            width: 48, height: 48, borderRadius: 3, flexShrink: 0,
            border: '1px solid #DBEAFE',
          }}
        >
          <Sparkles size={24} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: tk.text.primary, letterSpacing: '-0.02em' }}>
            AI Custom Branded Report
          </Typography>
          <Typography variant="body2" sx={{ color: tk.text.muted, mt: 0.25 }}>
            Get your analysis reports personalised with your company branding.
          </Typography>
        </Box>
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {loadingStatus ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ color: tk.primary }} />
          </Box>
        ) : fetchError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {fetchError}
          </Alert>
        ) : (
          <Card
            sx={{
              borderRadius: '36px',
              border: `1px solid ${tk.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              bgcolor: tk.cardBg,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Timeline badge */}
            <Chip
              label="We'll contact you in 1–2 working days"
              size="small"
              icon={<PhoneCall size={12} style={{ marginLeft: 8 }} />}
              sx={{
                position: 'absolute', top: -14, right: 24,
                bgcolor: tk.primary, color: '#fff',
                fontWeight: 700, fontSize: '0.72rem',
                letterSpacing: '0.03em',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                height: 28,
                '& .MuiChip-icon': { color: '#fff' },
              }}
            />

            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>

              {/* ── Description ── */}
              <Box>
                <Typography variant="body2" sx={{ color: tk.text.secondary, lineHeight: 1.7 }}>
                  Get your analysis reports with your company name, logo, colours, contact details and social links.
                  Our team will contact you within <strong>1–2 working days</strong> to collect all customisation details.
                </Typography>
              </Box>

              {/* ── Benefits checklist ── */}
              <Box
                sx={{
                  bgcolor: '#F8FAFC', border: `1px solid ${tk.border}`,
                  borderRadius: 2.5, p: 2.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, letterSpacing: '0.06em', color: '#475569', textTransform: 'uppercase', display: 'block', mb: 2 }}
                >
                  WHAT'S INCLUDED
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  {CHECKLIST.map((text) => (
                    <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                      <Check size={15} color="#059669" style={{ marginTop: 3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: tk.text.primary, lineHeight: 1.4 }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ── Sample branded reports ── */}
              {!isPaidActive && <BrandedSamples />}

              {/* ── Divider ── */}
              <Box sx={{ borderTop: `1px solid ${tk.border}` }} />

              {/* ── Status view OR payment form ── */}
              {isPaidActive ? (
                <StatusView request={activeRequest} />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* ── One-time price card ── */}
                  <Box
                    sx={{
                      bgcolor: '#EFF6FF', border: '1px solid #BFDBFE',
                      borderRadius: 2.5, p: 2.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: tk.text.primary, fontSize: '1.05rem' }}>
                        {inr0(price)} <Box component="span" sx={{ fontWeight: 600, fontSize: '0.82rem', color: tk.text.secondary }}>one-time</Box>
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: tk.text.secondary, mt: 0.5, lineHeight: 1.5 }}>
                        Branding setup fee — paid once. AI analysis reports are still charged separately at the current AI rate.
                      </Typography>
                    </Box>
                    <Chip
                      label="One-time"
                      size="small"
                      sx={{ bgcolor: tk.primary, color: '#fff', fontWeight: 700, borderRadius: '9999px' }}
                    />
                  </Box>

                  {isUnpaidSkeleton && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      You have an unfinished payment for {activeRequest.requestId}. Complete the payment below to activate your request.
                    </Alert>
                  )}

                  {/* ── Step 1: contact details (payment stays hidden) ── */}
                  {!detailsConfirmed ? (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tk.text.primary }}>
                        Request Callback
                      </Typography>
                      <Typography variant="body2" sx={{ color: tk.text.muted, mt: -1.5 }}>
                        Leave your contact details and we'll reach out to you.
                      </Typography>

                      {/* Email field */}
                      <Field
                        id="cbr-email"
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                        error={emailErr}
                        placeholder="you@company.com"
                        disabled={paying}
                      />

                      {/* Phone field */}
                      <Field
                        id="cbr-phone"
                        label="Phone number"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                        error={phoneErr}
                        placeholder="9XXXXXXXXX"
                        hint="10-digit Indian mobile number (optional +91 prefix)"
                        disabled={paying}
                      />

                      <Button
                        id="cbr-submit-btn"
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleDetailsSubmit}
                        startIcon={<PhoneCall size={18} />}
                        sx={pillBtn}
                      >
                        Submit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tk.text.primary }}>
                        {isUnpaidSkeleton ? 'Complete payment' : 'Request Callback'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: tk.text.muted, mt: -1.5 }}>
                        Choose how to pay the one-time fee, and we'll reach out to you.
                      </Typography>

                      {/* Confirmed contact summary with edit */}
                      <Box
                        sx={{
                          bgcolor: '#F8FAFC', border: `1px solid ${tk.border}`,
                          borderRadius: 2, p: 2, display: 'flex',
                          alignItems: 'center', justifyContent: 'space-between', gap: 2,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: tk.text.primary }}>
                            {email.trim()}
                          </Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: tk.text.muted }}>
                            {phone.replace(/\D/g, '').length === 10 ? `+91 ${phone.replace(/\D/g, '')}` : phone}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => !paying && setDetailsConfirmed(false)}
                          disabled={paying}
                          sx={{ fontWeight: 700, textTransform: 'none', flexShrink: 0 }}
                        >
                          Edit
                        </Button>
                      </Box>

                  {/* ── Payment method picker ── */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: tk.text.secondary, letterSpacing: '0.04em' }}>
                      PAYMENT METHOD <Box component="span" sx={{ color: tk.error }}>*</Box>
                    </Typography>

                    {/* Wallet option */}
                    <Box
                      onClick={() => !paying && setPayMethod('wallet')}
                      sx={{
                        border: `1.5px solid ${payMethod === 'wallet' ? tk.borderFocus : tk.border}`,
                        borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                        cursor: paying ? 'not-allowed' : 'pointer',
                        bgcolor: payMethod === 'wallet' ? '#EFF6FF' : '#fff',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <Radio checked={payMethod === 'wallet'} onChange={() => setPayMethod('wallet')} disabled={paying} sx={{ p: 0 }} />
                      <Wallet size={20} color={tk.primary} style={{ flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tk.text.primary }}>
                          Wallet credits
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: quote.canAffordWallet ? tk.text.muted : tk.error }}>
                          Balance {inr0(quote.walletBalance)}
                          {!quote.canAffordWallet && ` — short by ${inr0(price - quote.walletBalance)}, recharge to use this option`}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: tk.text.primary }}>
                        {inr0(price)}
                      </Typography>
                    </Box>

                    {/* Razorpay option */}
                    <Box
                      onClick={() => !paying && setPayMethod('razorpay')}
                      sx={{
                        border: `1.5px solid ${payMethod === 'razorpay' ? tk.borderFocus : tk.border}`,
                        borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                        cursor: paying ? 'not-allowed' : 'pointer',
                        bgcolor: payMethod === 'razorpay' ? '#EFF6FF' : '#fff',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <Radio checked={payMethod === 'razorpay'} onChange={() => setPayMethod('razorpay')} disabled={paying} sx={{ p: 0 }} />
                      <CreditCard size={20} color={tk.primary} style={{ flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tk.text.primary }}>
                          Razorpay
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: tk.text.muted }}>
                          UPI · Cards · Net banking · Wallets
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: tk.text.primary }}>
                        {inr0(price)}
                      </Typography>
                    </Box>
                  </Box>

                  {payError && (
                    <Alert
                      severity="error"
                      sx={{ borderRadius: 2 }}
                      onClose={() => { setPayError(null); setNeedsRecharge(false); }}
                      action={needsRecharge ? (
                        <Button
                          size="small"
                          sx={{ fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}
                          onClick={() => { window.location.href = '/partner/add-funds'; }}
                        >
                          Add funds
                        </Button>
                      ) : undefined}
                    >
                      {payError}
                    </Alert>
                  )}

                  <Button
                    id="cbr-pay-btn"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={paying}
                    onClick={handlePay}
                    startIcon={paying
                      ? <CircularProgress size={18} sx={{ color: '#94A3B8' }} />
                      : (payMethod === 'wallet' ? <Wallet size={18} /> : <PhoneCall size={18} />)}
                    sx={pillBtn}
                  >
                    {paying
                      ? (payMethod === 'wallet' ? 'Processing wallet payment…' : 'Opening Razorpay…')
                      : (payMethod === 'wallet'
                        ? `Pay ${inr0(price)} with wallet`
                        : `Pay ${inr0(price)} with Razorpay`)}
                  </Button>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
                    {payMethod === 'wallet'
                      ? 'Debited instantly from your wallet. Ledgered under Custom Brand Fee.'
                      : 'Secured via Razorpay · Cards · Net banking · UPI · Wallets'}
                  </Typography>
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default CustomBrandedReportPage;
