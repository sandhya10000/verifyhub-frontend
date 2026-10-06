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
} from '@mui/material';
import { Sparkles, Check, CheckCircle2, PhoneCall } from 'lucide-react';
import useAuth from '../../context/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Design tokens (mirrors the rest of the portal)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

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
        { label: 'Phone', value: request.phone.length === 10 ? `+91 ${request.phone}` : request.phone },
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
  const { user } = useAuth();

  // Remote state
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({ email: false, phone: false });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false); // shows success in-page after submit

  // ── Pre-fill from profile ──────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.phone && !phone) {
      // Strip +91 prefix if present for the editable field
      setPhone(String(user.phone).replace(/^\+91/, '').replace(/\D/g, ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Fetch current request status ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingStatus(true);
      setFetchError(null);
      try {
        const res = await axios.get(`${API_BASE}/partner/custom-branded-report`, {
          headers: authHeader(),
        });
        setActiveRequest(res.data.data || null);
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, phone: true });
    if (!formValid || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await axios.post(
        `${API_BASE}/partner/custom-branded-report`,
        { email: email.trim(), phone: phone.replace(/\D/g, '') },
        { headers: authHeader() },
      );
      setActiveRequest(res.data.data);
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.code === 'DUPLICATE_REQUEST') {
        // Another tab already submitted — just load the existing one
        setActiveRequest(err.response.data.data);
        setSubmitted(true);
      } else {
        setSubmitError(
          err.response?.data?.message || 'Submission failed. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const showStatus = Boolean(activeRequest); // already has an active request

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
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
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

              {/* ── Divider ── */}
              <Box sx={{ borderTop: `1px solid ${tk.border}` }} />

              {/* ── Status view OR form ── */}
              {showStatus ? (
                <StatusView request={activeRequest} />
              ) : (
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />

                  {submitError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setSubmitError(null)}>
                      {submitError}
                    </Alert>
                  )}

                  <Button
                    id="cbr-submit-btn"
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} sx={{ color: '#94A3B8' }} /> : <PhoneCall size={18} />}
                    sx={pillBtn}
                  >
                    {submitting ? 'Submitting…' : 'Request Callback'}
                  </Button>
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
