import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  Printer,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const WHAT_HAPPENS_NEXT = [
  {
    icon: '📞',
    title: 'We call / message you',
    desc: 'A dedicated brand specialist from our team will reach out on your registered contact within 1–2 working days.',
  },
  {
    icon: '🎨',
    title: 'We collect your brand assets',
    desc: 'Logo, colours, tagline, contact details — all collected by our specialist over call or email. No portal form required.',
  },
  {
    icon: '📄',
    title: 'Reports go live with your brand',
    desc: 'Every AI credit report you pull will automatically carry your firm\'s branding from that point forward.',
  },
];

export const BrandedReportPaidView = ({
  statusData,
  activeRequest,
  onStatusUpdate,
}) => {
  const status = statusData?.status || activeRequest?.status || 'paid';
  const paidAt = statusData?.paid_at || activeRequest?.updatedAt || new Date();
  const amount = statusData?.amount || activeRequest?.amount || 2500;
  const onboardingDetails = statusData?.onboarding_details || {};

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const formattedDate = new Date(paidAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusLabel =
    status === 'active'
      ? 'Active & Live'
      : status === 'onboarding'
      ? 'In Progress'
      : 'Payment Received';

  const statusColor =
    status === 'active'
      ? { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' }
      : status === 'onboarding'
      ? { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }
      : { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };

  return (
    <Box
      id="branding-status-section"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Confirmation Hero */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#FFFFFF',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px -4px rgba(37,99,235,0.10)',
          p: { xs: 3, md: 5 },
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Decorative glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 360,
            height: 260,
            background:
              'radial-gradient(ellipse at top, rgba(37,99,235,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Success icon */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#DCFCE7',
            border: '2px solid #86EFAC',
            mb: 2.5,
          }}
        >
          <CheckCircle2 size={36} color="#15803D" strokeWidth={2} />
        </Box>

        <Chip
          label={statusLabel}
          size="small"
          sx={{
            bgcolor: statusColor.bg,
            color: statusColor.text,
            border: `1px solid ${statusColor.border}`,
            fontWeight: 700,
            fontSize: '0.75rem',
            mb: 1.5,
            display: 'flex',
            mx: 'auto',
            width: 'fit-content',
          }}
        />

        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.625rem', md: '2rem' },
            fontWeight: 900,
            color: '#0F172A',
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          Payment confirmed. We'll be in touch.
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.9375rem', md: '1rem' },
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: 520,
            mx: 'auto',
            mb: 3,
          }}
        >
          Your {inr(amount)} setup fee has been received. Our branding team will contact
          you within <strong>1–2 working days</strong> to collect your logo,
          colours, and firm details — no form needed on your end.
        </Typography>

        {/* Payment summary strip */}
        <Box
          sx={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: { xs: 2, sm: 4 },
            justifyContent: 'center',
            px: { xs: 2, md: 4 },
            py: 1.75,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 3,
            mb: 3,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Amount Paid
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: '#0F172A', mt: 0.25 }}>
              {inr(amount)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Date & Time
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', mt: 0.25 }}>
              {formattedDate}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Method
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', mt: 0.25 }}>
              {activeRequest?.paymentMethod === 'WALLET' ? 'Wallet Credits' : 'Razorpay / Instant Pay'}
            </Typography>
          </Box>
          {activeRequest?.requestId && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Request ID
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', mt: 0.25 }}>
                {activeRequest.requestId}
              </Typography>
            </Box>
          )}
        </Box>

        
      </Box>

      {/* What Happens Next */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          p: { xs: 3, md: 4 },
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Clock size={16} color="#2563EB" />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.05em' }}>
            What happens next
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', mb: 3 }}>
          We handle everything from here
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {WHAT_HAPPENS_NEXT.map((step, i) => (
            <Box
              key={i}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>{step.icon}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>
                {step.title}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5 }}>
                {step.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      

     
    </Box>
  );
};

export default BrandedReportPaidView;
