import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { Sparkles, Wallet } from 'lucide-react';
import useAuth from '../../context/useAuth';
import axios from 'axios';
import AutoCropBanner from '../../Components/shared/AutoCropBanner';
import { planLabel, FALLBACK_RECHARGE_PLANS, bonusForPlan, inr0 } from './planConfig';

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

// Backend origin for uploaded assets: API base is "<origin>/api", banner
// paths from the server are relative ("/uploads/banners/..."). Bundled
// frontend assets ("/Add_Funds_banner.png") resolve as-is.
const resolveBannerSrc = (imageUrl) => {
  if (!imageUrl) return '/Add_Funds_banner.png';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}${imageUrl}`;
  }
  return imageUrl;
};

const AddFunds = () => {
  // First top-up flips the sidebar from Add Funds to Pricing instantly.
  const { user, token, login, hasToppedUp, setHasToppedUp } = useAuth();
  const headerRef = useRef(null);
  const [showStrip, setShowStrip] = useState(false);

  // Sticky reminder strip: appears once the header (with the unlock line)
  // scrolls out of view — only for never-topped-up partners.
  useEffect(() => {
    if (hasToppedUp !== false) { setShowStrip(false); return; }
    const el = headerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => setShowStrip(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasToppedUp]);

  const scrollToTopUp = () => {
    document.getElementById('recharge-plans')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  // Plans-only checkout: partner picks one of the recharge plans
  // (server list, fallback to founder table). No free-form amounts —
  // the server rejects anything that isn't an exact plan pay value.
  const [rechargePlans, setRechargePlans] = useState(FALLBACK_RECHARGE_PLANS);
  // ?amount= prefill only applies when it matches a plan pay value.
  let queryAmount = null;
  try {
    const q = new URLSearchParams(window.location.search).get('amount');
    if (q && /^\d+(\.\d{1,2})?$/.test(q) && Number(q) > 0) queryAmount = Number(q);
  } catch { /* ignore */ }
  const defaultPay = (() => {
    if (queryAmount && FALLBACK_RECHARGE_PLANS.some((p) => Number(p.pay) === queryAmount)) return queryAmount;
    return 1000;
  })();
  const [selectedPay, setSelectedPay] = useState(defaultPay);
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

  const selectedPlan = rechargePlans.find((p) => Number(p.pay) === Number(selectedPay)) || null;
  const parsedAmount = Number(selectedPlan?.pay || selectedPay) || 0;
  const walletCredit = Number(selectedPlan?.credit || parsedAmount) || 0;
  const bonusCredit = Math.max(0, walletCredit - parsedAmount);
  // Admin-editable banner (Admin → Banners); falls back to the bundled PNG.
  const [bannerSrc, setBannerSrc] = useState('/Add_Funds_banner.png');
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerCrop, setBannerCrop] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/partner/pricing/plans`)
      .then(({ data }) => {
        if (data?.success) {
          const live = Array.isArray(data.data?.rechargePlans) && data.data.rechargePlans.length
            ? data.data.rechargePlans
            : FALLBACK_RECHARGE_PLANS;
          setRechargePlans(live);
          // Keep the selection valid once live plans load (?amount= wins when it matches).
          if (queryAmount && live.some((p) => Number(p.pay) === queryAmount)) {
            setSelectedPay(queryAmount);
          } else if (!live.some((p) => Number(p.pay) === defaultPay)) {
            setSelectedPay(Number(live[0]?.pay || 1000));
          }
          const b = data.data?.addFundsBanner;
          if (b?.imageUrl) setBannerSrc(resolveBannerSrc(b.imageUrl));
          if (typeof b?.enabled === 'boolean') setBannerEnabled(b.enabled);
          setBannerCrop({
            top: Number(b?.cropTop) || 0,
            bottom: Number(b?.cropBottom) || 0,
            left: Number(b?.cropLeft) || 0,
            right: Number(b?.cropRight) || 0,
          });
        }
      })
      .catch(() => { /* fallback plans stay */ });
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

  const handleProceed = () => {
    if (!selectedPlan) {
      setAmountError('Please choose a recharge plan.');
      return;
    }
    setAmountError('');
    setPayBanner(null);
    // Gateway is the only way to add funds — Razorpay collects the plan pay
    // value, the wallet is credited pay + bonus.
    handleGatewayPay(Number(selectedPlan.pay));
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
      const createdOrderId = data.orderId;
      // Best-effort: resolve our PENDING row so a dismissed/failed checkout
      // shows Failed instead of sitting in history as Pending forever.
      // Silent on failure; server only flips PENDING rows (SUCCESS untouched,
      // and a same-order retry can still verify to SUCCESS afterwards).
      const markOrderCancelled = () => {
        axios.post(`${API_BASE_URL}/wallet-recharge/cancel`, { orderId: createdOrderId }, { headers })
          .catch(() => { /* non-fatal — row stays Pending until retried */ });
      };
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: createdOrderId,
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
              // First top-up gets an unlock confirmation (reinforces the highlight line).
              const unlockedNote = firstTimer ? ' All services unlocked — bureau reports, AI analysis, RC & GST verification.' : '';
              const credited = verifyRes.data?.credited ?? amt;
              const bonus = verifyRes.data?.bonusCredit ?? 0;
              setPayBanner({
                tone: 'success',
                text: `${inr2(credited)} added to wallet${bonus > 0 ? ` (incl. ${inr2(bonus)} bonus)` : ''}${verifyRes.data.plan ? ` · ${planLabel(verifyRes.data.plan)} plan active` : ''}. New balance ${inr2(newBalance ?? credited)}.${unlockedNote}`,
              });
              if (verifyRes.data.autoAssigned) setFirstTimer(false);
              // First successful credit: swap the sidebar to Pricing at once.
              setHasToppedUp?.(true);
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
        modal: { ondismiss: () => { markOrderCancelled(); setPaying(false); } },
      });
      rzp.on('payment.failed', () => { markOrderCancelled(); setPaying(false); });
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
        ref={headerRef}
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
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
              bgcolor: '#EDE9FE', color: '#6D28D9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Wallet size={30} />
          </Box>
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
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, flexShrink: 0,
              bgcolor: '#ECFDF5', border: '1.5px solid #A7F3D0', pl: 1, pr: 2, py: 1, borderRadius: 999,
              boxShadow: '0 2px 8px rgba(5,150,105,.15)', whiteSpace: 'nowrap',
            }}
          >
            <Box
              sx={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                bgcolor: '#059669', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Wallet size={17} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#047857', lineHeight: 1, letterSpacing: '0.04em' }}>
                WALLET
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#065F46', lineHeight: 1.25 }}>
                {inr2(user?.walletBalance ?? 0)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        {/* Admin-editable banner (Admin → Banners). Hidden when disabled.
            Framed with breathing room inside the header card; AutoCropBanner
            strips baked-in black letterbox bars dynamically. */}
        {bannerEnabled && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: 0 }}>
            <AutoCropBanner
              src={bannerSrc}
              alt="Wallet recharge offers"
              minTop={bannerCrop.top}
              minBottom={bannerCrop.bottom}
              minLeft={bannerCrop.left}
              minRight={bannerCrop.right}
              sx={{
                borderRadius: '16px',
                boxShadow: '0 8px 28px rgba(76,29,149,.22)',
              }}
            />
          </Box>
        )}
      </Card>

      {/* Sticky reminder — shows once the header scrolls away (first-timers only). */}
      {hasToppedUp === false && showStrip && (
        <Box
          sx={{
            position: 'sticky', top: 76, zIndex: 5,
            mb: 2, p: 1.25, pl: 2, pr: 1.25, borderRadius: '10px',
            bgcolor: '#fff', border: '1px solid', borderColor: 'divider',
            boxShadow: '0 4px 16px rgba(15,27,45,.10)',
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}
        >
          <Sparkles size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
          <Typography
            sx={{
              fontWeight: 600, fontSize: '0.85rem', flexGrow: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            One top-up unlocks everything —{' '}
            <Box component="span" sx={{ fontWeight: 800, color: '#3730A3' }}>
              starting at just ₹10
            </Box>
          </Typography>
          <Button
            size="small" variant="contained" disableElevation onClick={scrollToTopUp}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, bgcolor: '#3730A3', whiteSpace: 'nowrap', px: 2 }}
          >
            Top up now
          </Button>
        </Box>
      )}

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
                Choose a recharge plan
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                Pay the plan price via Razorpay — your wallet is credited the total shown, bonus included. Only generated reports are charged. See Pricing for all rates.
              </Typography>

              {firstTimer && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  Your first top-up activates the single launch plan automatically.
                </Alert>
              )}

              {forPlanNotice && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  {forPlanNotice}
                </Alert>
              )}

              <Grid container spacing={1.5} sx={{ mb: 1 }} id="recharge-plans">
                {rechargePlans.map((plan) => {
                  const pay = Number(plan.pay);
                  const credit = Number(plan.credit);
                  const bonus = bonusForPlan(plan);
                  const selected = Number(selectedPay) === pay;
                  const popular = pay === 5000;
                  return (
                    <Grid size={{ xs: 6, sm: 4 }} key={pay}>
                      <Box
                        onClick={() => { setSelectedPay(pay); setAmountError(''); }}
                        sx={{
                          position: 'relative', cursor: 'pointer', borderRadius: '12px', p: 1.75,
                          border: selected ? '2px solid #6D28D9' : '1px solid #E5E7EB',
                          bgcolor: selected ? '#F5F0FF' : '#fff',
                          boxShadow: selected ? '0 4px 16px rgba(109,40,217,.18)' : 'none',
                          transition: 'all .15s ease',
                        }}
                      >
                        {popular && (
                          <Box sx={{ position: 'absolute', top: -11, left: 12, bgcolor: '#6D28D9', color: '#fff', fontSize: '0.62rem', fontWeight: 800, px: 1.25, py: 0.25, borderRadius: 999 }}>
                            Most Popular
                          </Box>
                        )}
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{inr2(pay).replace('.00', '')}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Total Credit
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: bonus > 0 ? '#059669' : 'text.primary' }}>
                          {inr2(credit).replace('.00', '')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: bonus > 0 ? '#059669' : 'text.disabled', fontWeight: 700 }}>
                          {bonus > 0 ? `+${inr0(bonus)} bonus` : 'No bonus'}
                        </Typography>
                        <Box sx={{
                          mt: 1, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, py: 0.75, borderRadius: '8px',
                          bgcolor: selected ? '#6D28D9' : '#F1F0FF', color: selected ? '#fff' : '#6D28D9',
                        }}>
                          {selected ? '✓ Selected' : 'Select Plan'}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
              {amountError && (
                <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1 }}>{amountError}</Typography>
              )}

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, mt: 1.5, textAlign: 'center' }}>
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
                disabled={paying || !selectedPlan}
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
                {paying ? 'Processing payment…' : `Pay ${inr2(parsedAmount)} → Get ${inr2(walletCredit)}`}
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
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Recharge Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{inr2(parsedAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Extra Credit</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: bonusCredit > 0 ? '#059669' : 'text.primary' }}>{inr2(bonusCredit)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total Wallet Credit</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{inr2(walletCredit)}</Typography>
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
