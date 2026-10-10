import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Alert, Radio, Grid } from '@mui/material';
import { Wallet, CreditCard } from 'lucide-react';
import useAuth from '../../context/useAuth';
import {
  StickyQuickBar, HeroSection, CustomisationGrid, ThemesGallery, WorkflowTimeline,
  PricingCard} from './components/BrandedReportSections';
import { BRANDED_REPORT_COPY } from '../../constants/brandedReportCopy';

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

const FALLBACK_PRICE = 2500;

const inr0 = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

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

const FadeInSection = ({ children, delay = 0 }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = React.useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return (
    <Box
      ref={domRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : 'translateY(24px)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          opacity: 1,
          transform: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
};

const CustomBrandedReportPage = () => {
  const { user, login, token } = useAuth();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [quote, setQuote] = useState({ price: FALLBACK_PRICE, walletBalance: user?.walletBalance ?? 0, canAffordWallet: true });
  const price = quote.price ?? FALLBACK_PRICE;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ email: false, phone: false });
  const [detailsConfirmed, setDetailsConfirmed] = useState(true);

  const [payMethod, setPayMethod] = useState('wallet');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [needsRecharge, setNeedsRecharge] = useState(false);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.phone && !phone) {
      setPhone(String(user.phone).replace(/^\+91/, '').replace(/\D/g, ''));
    }
  }, [user]);

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
        const existing = statusRes.data.data;
        if (existing && existing.paymentStatus !== 'Paid') {
          if (existing.email) setEmail(existing.email);
          if (existing.phone) setPhone(String(existing.phone).replace(/^\+91/, '').replace(/\D/g, ''));
        }
      } catch (err) {
        setFetchError('Could not load your request status. Please try again.');
      } finally {
        setLoadingStatus(false);
      }
    };
    load();
  }, []);

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
      if (err.response?.data?.code === 'DUPLICATE_REQUEST') {
        setActiveRequest(err.response.data.data);
      } else {
        setPayError(err?.response?.data?.message || 'Could not start online payment. Please retry.');
      }
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (payMethod === 'wallet') return handleWalletPay();
    return handleRazorpayPay();
  };

  const isPaidActive = Boolean(activeRequest && activeRequest.paymentStatus === 'Paid' && activeRequest.status === 'Active');
  const isUnpaidSkeleton = Boolean(activeRequest && activeRequest.paymentStatus !== 'Paid');
  const shortfall = Math.max(0, price - quote.walletBalance);

  if (loadingStatus) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} sx={{ color: tk.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0, pb: { xs: 5, md: 10 }, bgcolor: '#f8fafc', minHeight: '100vh', overflowX: 'clip', boxSizing: 'border-box' }}>
      <StickyQuickBar />
      <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', mt: { xs: 3, md: 5 }, px: { xs: 1.5, sm: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: { xs: 7, sm: 8, md: 10 }, boxSizing: 'border-box', '& > *': { width: '100%', minWidth: 0, boxSizing: 'border-box' } }}>
        <FadeInSection><HeroSection /></FadeInSection>
        <FadeInSection><CustomisationGrid /></FadeInSection>
        <FadeInSection><ThemesGallery /></FadeInSection>
        <FadeInSection><WorkflowTimeline /></FadeInSection>
        <FadeInSection><PricingCard /></FadeInSection>

        <FadeInSection>
          <Box id="payment-section" sx={{ width: '100%', boxSizing: 'border-box', bgcolor: '#fff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', p: { xs: 2, sm: 3, md: 4 }, minWidth: 0, overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, minWidth: 0 }}>
                <Box>
                  <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 900, color: '#0f172a' }}>Complete payment</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5 }}>Choose how to pay the one-time fee, and we'll reach out to configure your branding.</Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>{inr0(price)}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>{BRANDED_REPORT_COPY.gstNotice}</Typography>
                </Box>
              </Box>

              {isUnpaidSkeleton && (
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'flex-start', gap: 1.5, color: '#78350f' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>You have an unfinished payment for request <Box component="span" sx={{ fontFamily: 'monospace' }}>{activeRequest.requestId}</Box>.</Typography>
                    <Typography sx={{ color: '#b45309', mt: 0.25, fontSize: '0.875rem' }}>Complete the payment below to activate your branding onboarding request immediately.</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'rgba(248, 250, 252, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Design Specialist Contact Details</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', mt: 0.5 }}>{email || 'N/A'}</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontFamily: 'monospace' }}>{phone || 'N/A'}</Typography>
              </Box>
              <Button onClick={() => alert('Contact details modal: You can update your contact phone for onboarding')} sx={{ px: 2, py: 1, borderRadius: 2, border: '1px solid #cbd5e1', bgcolor: '#fff', color: '#334155', fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#f8fafc' } }}>
                Edit
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Payment Method <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>

              <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
                <Grid item xs={12} md={6}>
                  <Box onClick={() => setPayMethod('wallet')} sx={{ p: 2.5, borderRadius: 4, border: `${payMethod === 'wallet' ? '2px' : '1px'} solid ${payMethod === 'wallet' ? '#2563eb' : '#e2e8f0'}`, bgcolor: payMethod === 'wallet' ? 'rgba(239, 246, 255, 0.6)' : '#fff', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, height: '100%', minWidth: 0, boxSizing: 'border-box', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Radio checked={payMethod === 'wallet'} onChange={() => setPayMethod('wallet')} sx={{ p: 0 }} />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Wallet size={18} color="#2563eb" />
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Wallet credits</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.5 }}>
                          Balance {inr0(quote.walletBalance)} {shortfall > 0 && <Box component="span">— <Box component="span" sx={{ color: '#e11d48', fontWeight: 600 }}>short by {inr0(shortfall)}</Box></Box>}
                        </Typography>
                        {shortfall > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button onClick={(e) => { e.stopPropagation(); window.location.href = '/partner/add-funds'; }} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#ffe4e6' } }}>
                              + Recharge {inr0(shortfall)}
                            </Button>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>to unlock wallet checkout</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{inr0(price)}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box onClick={() => setPayMethod('razorpay')} sx={{ p: 2.5, borderRadius: 4, border: `${payMethod === 'razorpay' ? '2px' : '1px'} solid ${payMethod === 'razorpay' ? '#2563eb' : '#e2e8f0'}`, bgcolor: payMethod === 'razorpay' ? 'rgba(239, 246, 255, 0.6)' : '#fff', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, height: '100%', minWidth: 0, boxSizing: 'border-box', flexWrap: { xs: 'wrap', sm: 'nowrap' }, '&:hover': { borderColor: payMethod === 'razorpay' ? '#2563eb' : '#cbd5e1' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Radio checked={payMethod === 'razorpay'} onChange={() => setPayMethod('razorpay')} sx={{ p: 0 }} />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCard size={18} color="#059669" />
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Razorpay / Instant Pay</Typography>
                          <Box component="span" sx={{ fontSize: '0.625rem', fontWeight: 700, bgcolor: '#d1fae5', color: '#065f46', px: 0.75, py: 0.1, borderRadius: 1 }}>Recommended</Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>UPI (GPay, PhonePe, Paytm), Cards, Net banking & Wallets</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{inr0(price)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}>
              <Button onClick={handlePay} disabled={paying} sx={{ width: '100%', py: 2, borderRadius: 4, bgcolor: '#2563eb', color: '#fff', fontSize: '1rem', fontWeight: 700, textTransform: 'none', boxShadow: '0 20px 25px -5px rgba(37,99,235,0.1), 0 10px 10px -5px rgba(37,99,235,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: '#1d4ed8' }, '&.Mui-disabled': { bgcolor: '#94a3b8', color: '#f8fafc' } }}>
                {paying ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : (payMethod === 'wallet' ? <Wallet size={20} /> : <CreditCard size={20} />)}
                {paying ? 'Processing payment...' : `Pay ${inr0(price)} ${payMethod === 'wallet' ? `with wallet${shortfall > 0 ? ' (Requires Recharge)' : ''}` : 'with Razorpay / Instant UPI'}`}
              </Button>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                🔒 {BRANDED_REPORT_COPY.checkoutSecurity}. Debited securely. Tax Invoice with GST input credit available immediately upon receipt.
              </Typography>
            </Box>

            {payError && (
              <Alert severity="error" sx={{ borderRadius: 3 }} onClose={() => { setPayError(null); setNeedsRecharge(false); }}>
                {payError}
              </Alert>
            )}

            {isPaidActive && (
              <Alert severity="success" sx={{ borderRadius: 3 }}>
                You have successfully paid for the AI Custom Branded Report! Our team will reach out soon.
              </Alert>
            )}
          </Box>
        </FadeInSection>
      </Box>
    </Box>
  );
};

export default CustomBrandedReportPage;
