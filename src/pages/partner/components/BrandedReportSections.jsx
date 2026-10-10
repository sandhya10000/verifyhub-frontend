import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Grid, Collapse, IconButton } from '@mui/material';
import { BRANDED_REPORT_COPY } from '../../../constants/brandedReportCopy';

const tk = {
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  blue900: '#1e3a8a',
  blue950: '#172554',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',
  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald200: '#a7f3d0',
  emerald300: '#6ee7b7',
  emerald400: '#34d399',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065f46',
  emerald900: '#064e3b',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber300: '#fcd34d',
  amber400: '#fbbf24',
  amber500: '#f59e0b',
  amber700: '#b45309',
  amber900: '#78350f',
  indigo100: '#e0e7ff',
  indigo700: '#4338ca',
  purple100: '#f3e8ff',
  purple600: '#9333ea',
  purple700: '#7e22ce',
  cyan100: '#cffafe',
  cyan700: '#0e7490',
  rose50: '#fff1f2',
  rose100: '#ffe4e6',
  rose200: '#fecdd3',
  rose600: '#e11d48',
  rose700: '#be123c',
};

export const StickyQuickBar = () => {
  const handleScroll = (e) => {
    e.preventDefault();
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 64,
        zIndex: 20,
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#fff',
        px: { xs: 2, md: 3 },
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${tk.slate800}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, bgcolor: 'rgba(59, 130, 246, 0.2)', color: tk.blue300, border: '1px solid rgba(96, 165, 250, 0.3)' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tk.blue400, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          OFFER
        </Box>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: tk.slate200 }}>
          <Box component="span" sx={{ fontWeight: 700, color: '#fff' }}>AI Custom Branded Report</Box> • ₹2,500 one-time setup
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: tk.amber400, fontWeight: 500 }}>
          ⏱️ Setup delivered in 1–2 working days
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          onClick={handleScroll}
          sx={{
            px: 2, py: 0.75, fontSize: '0.75rem', fontWeight: 600, borderRadius: 2, bgcolor: tk.blue600, color: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', textTransform: 'none',
            '&:hover': { bgcolor: tk.blue500 }
          }}
        >
          Pay & Activate
          <svg style={{ marginLeft: 6, width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </Button>
      </Box>
    </Box>
  );
};

export const HeroSection = () => {
  const handleScrollPay = (e) => {
    e.preventDefault();
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleScrollSamples = (e) => {
    e.preventDefault();
    document.getElementById('live-samples')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(0, 0.85fr)' },
        columnGap: { md: 5, lg: 8 },
        rowGap: 5,
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* LEFT: text */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'flex-start', minWidth: 0 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, bgcolor: tk.blue50, color: tk.blue700, border: `1px solid ${tk.blue200}` }}>
          <span>⚡</span> Turn Credit Reports Into Your Top Lead Magnet
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.25rem', sm: '2.75rem', md: '2.75rem', lg: '3.25rem' },
            fontWeight: 900,
            color: tk.slate900,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            textAlign: 'left',
          }}
        >
          Your brand on <br />
          <Box component="span" sx={{ position: 'relative', display: 'inline-block', color: tk.blue600 }}>
            every credit report.
          </Box>
        </Typography>

        <Typography sx={{ fontSize: { xs: '0.9375rem', md: '1rem' }, color: tk.slate600, lineHeight: 1.6, textAlign: 'left', maxWidth: 560 }}>
          Turn AI-analysed credit reports into your own high-trust marketing asset. Your logo, corporate colours, verified watermark, and contact details on every report shared with borrowers.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            { icon: '🛡️', text: 'One-time fee ₹2,500' },
            { icon: '✨', text: '2 free revisions included' },
            { icon: '⏱️', text: 'Setup in 1–2 working days' },
            { icon: '♾️', text: 'Applied to all future reports' },
          ].map((item) => (
            <Box key={item.text} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: '#fff', px: 1.25, py: 0.75, borderRadius: 2, border: `1px solid ${tk.slate200}`, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: 500, color: tk.slate700 }}>
              <span>{item.icon}</span> <strong>{item.text}</strong>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, pt: 0.5, width: '100%' }}>
          <Button onClick={handleScrollPay} sx={{ px: 3, py: 1.5, borderRadius: 3, bgcolor: tk.blue600, color: '#fff', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.25)', textTransform: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'transform 0.2s', '&:hover': { bgcolor: tk.blue700, transform: 'translateY(-2px)' }, width: { xs: '100%', sm: 'auto' } }}>
            <span>Get my branded report</span>
            <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 1.5, bgcolor: tk.blue700, color: tk.blue100, fontSize: '0.75rem', fontWeight: 700 }}>₹2,500</Box>
          </Button>
          <Button onClick={handleScrollSamples} sx={{ px: 3, py: 1.5, borderRadius: 3, border: `1px solid ${tk.slate300}`, bgcolor: '#fff', color: tk.slate700, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none', transition: 'background-color 0.2s', '&:hover': { bgcolor: tk.slate50 }, width: { xs: '100%', sm: 'auto' } }}>
            See live samples ↓
          </Button>
        </Box>
      </Box>

      {/* RIGHT: report preview */}
      <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, minWidth: 0, px: { xs: 1, md: 0 } }}>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 340 }}>
          {/* glow */}
          <Box sx={{ position: 'absolute', inset: -12, background: 'linear-gradient(to right, rgba(59,130,246,0.3), rgba(99,102,241,0.3))', borderRadius: '1.5rem', filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none' }} />

          {/* card */}
          <Box sx={{ position: 'relative', zIndex: 1, bgcolor: '#fff', borderRadius: '1rem', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', p: 2 }}>
            <Box sx={{ bgcolor: tk.slate900, m: -2, mb: 2, p: 2, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: 1, bgcolor: tk.blue600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem' }}>NC</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.1 }}>NORTHSTAR FINSERV</Typography>
                  <Typography noWrap sx={{ fontSize: '0.5625rem', color: tk.blue300 }}>DSA Partner ID: DL-88210</Typography>
                </Box>
              </Box>
              <Box component="span" sx={{ flexShrink: 0, fontSize: '0.5625rem', bgcolor: 'rgba(16,185,129,0.2)', color: tk.emerald300, px: 0.75, py: 0.25, borderRadius: 1, border: '1px solid rgba(52,211,153,0.3)', fontWeight: 600 }}>Verified Agent</Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, fontSize: '0.75rem', pb: 1, borderBottom: `1px solid ${tk.slate100}` }}>
                <Typography sx={{ color: tk.slate500, fontSize: 'inherit' }}>Applicant: Rohan Verma</Typography>
                <Typography sx={{ fontFamily: 'monospace', color: tk.slate700, fontWeight: 600, fontSize: 'inherit' }}>Score Date: 2024-03-24</Typography>
              </Box>

              <Box sx={{ bgcolor: tk.slate50, borderRadius: 3, p: 1.5, border: '1px solid rgba(226,232,240,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, color: tk.slate400, letterSpacing: '0.05em' }}>CIBIL Score</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: tk.emerald600, lineHeight: 1.2 }}>
                    742 <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: tk.emerald700 }}>/ 900</Box>
                  </Typography>
                  <Box component="span" sx={{ fontSize: '0.625rem', px: 0.75, py: 0.1, borderRadius: 1, bgcolor: tk.emerald100, color: tk.emerald800, fontWeight: 700 }}>EXCELLENT</Box>
                </Box>
                <Box sx={{ width: 60, height: 60, flexShrink: 0, borderRadius: '50%', border: `4px solid ${tk.emerald500}`, borderTopColor: tk.emerald200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: tk.slate600 }}>Top 12%</Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.6875rem', color: tk.slate600 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 'inherit' }}>Active Loans: 3</Typography>
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 700 }}>₹14,50,000</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 'inherit' }}>On-time Payment Rate:</Typography>
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 700, color: tk.emerald600 }}>100%</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 0.5, p: 1.25, borderRadius: 2, bgcolor: tk.emerald50, border: `1px solid ${tk.emerald200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: tk.emerald900, fontWeight: 600 }}>
                  <span style={{ fontSize: '1rem' }}>💬</span> Direct WhatsApp Callout
                </Box>
                <Box component="span" sx={{ flexShrink: 0, fontSize: '0.625rem', bgcolor: tk.emerald600, color: '#fff', px: 1, py: 0.25, borderRadius: 1, fontWeight: 700 }}>Apply Now</Box>
              </Box>

              <Typography sx={{ pt: 1, textAlign: 'center', fontSize: '0.5625rem', color: tk.slate400, borderTop: `1px solid ${tk.slate100}` }}>
                Powered by Northstar Finserv • Licensed Loan Distributor
              </Typography>
            </Box>
          </Box>

          {/* "Your Logo Here" badge */}
          <Box sx={{ position: 'absolute', top: -10, right: -8, zIndex: 2, bgcolor: tk.blue600, color: '#fff', fontSize: '0.6875rem', fontWeight: 700, px: 1.25, py: 0.5, borderRadius: '9999px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #fff', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>✨</span> Your Logo Here
          </Box>

          {/* floating stat */}
          <Box sx={{ position: 'absolute', bottom: -12, left: -8, zIndex: 2, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', p: 1.25, borderRadius: 3, border: `1px solid ${tk.slate200}`, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: tk.emerald100, color: tk.emerald700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>✓</Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tk.slate900 }}>{BRANDED_REPORT_COPY.clientInquiriesStat}</Typography>
              <Typography sx={{ fontSize: '0.625rem', color: tk.slate500 }}>{BRANDED_REPORT_COPY.clientInquiriesDesc}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};



export const CustomisationGrid = () => {
  const cards = [
    { icon: '🖼️', title: 'Company Logo & Wordmark', desc: 'High-resolution PNG, SVG, or JPEG integration seamlessly scaled for crystal-clear vector PDF export.', color: 'blue' },
    { icon: '🎨', title: 'Custom Brand Palette', desc: "Match your primary, secondary, and badge colors with your firm's brand book or official website theme.", color: 'indigo' },
    { icon: '🏷️', title: 'Company Name & Tagline', desc: 'Prominent custom headers on every page highlighting your registration number, DSA codes, and slogan.', color: 'emerald' },
    { icon: '📞', title: 'Direct Contact & Office Info', desc: 'Clickable phone numbers, direct one-tap WhatsApp chat links, agency email, and registered office address.', color: 'amber' },
    { icon: '🌐', title: 'Social & Web Presence', desc: 'LinkedIn, Instagram, official portal links, plus dynamic QR code generated for borrowers to connect in 1 scan.', color: 'purple' },
    { icon: '📑', title: 'Header & Executive Summary', desc: 'Personalised advisory commentary, custom legal disclaimer, and certified loan officer sign-off stamp.', color: 'cyan' }
  ];

  const handleScrollPay = (e) => {
    e.preventDefault();
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: tk.blue600, mb: 0.5 }}>
            Customisation Breakdown
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 800, color: tk.slate900 }}>
            What you can personalise
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: tk.slate500, textAlign: { md: 'right' } }}>
          Tailored by our dedicated design team
        </Typography>
      </Box>

      {/* Cards: 2 columns x 3 rows on md+, 1 column on mobile */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
          gridTemplateRows: { xs: 'none', md: 'repeat(2, 1fr)' },
          gridAutoFlow: { xs: 'row', md: 'column' }, // fills left column first, then right
          gridAutoRows: { xs: '1fr', md: 'auto' },
          alignItems: 'stretch',
        }}
      >
        {cards.map((c, i) => (
          <Box
            key={i}
            sx={{
              bgcolor: '#fff',
              p: 3,
              borderRadius: 4,
              border: `1px solid ${tk.slate200}`,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 30px -10px rgba(15, 23, 42, 0.1)' },
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: tk[`${c.color}100`],
                color: tk[`${c.color}700`],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
                mb: 2,
              }}
            >
              {c.icon}
            </Box>
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 700, color: tk.slate900 }}>
              {c.title}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: tk.slate600, mt: 1, lineHeight: 1.625 }}>
              {c.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Full-width banner below the grid */}
      <Box
        sx={{
          mt: 3,
          background: 'linear-gradient(to bottom right, #1e3a8a, #020617)',
          p: 3,
          borderRadius: 4,
          border: `1px solid ${tk.blue800}`,
          color: '#fff',
          boxShadow: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            ⚡
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              + More customisations available on request during onboarding
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: tk.slate300, mt: 0.5 }}>
              Need custom loan eligibility tables or partner co-branding? Our team customizes it directly on your request.
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={handleScrollPay}
          sx={{ px: 3, py: 1.5, borderRadius: 3, bgcolor: tk.blue500, color: '#fff', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0, textTransform: 'none', transition: 'background-color 0.2s', '&:hover': { bgcolor: tk.blue400 }, width: { xs: '100%', md: 'auto' } }}
        >
          Get Started Now
        </Button>
      </Box>
    </Box>
  );
};



export const ThemesGallery = () => {
  const themes = [
    {
      name: 'Northstar Finserv', bgH: tk.slate900, initBg: tk.blue600, init: 'NS', dot: tk.blue400,
      tName: 'Navy & Royal Blue', colors: [tk.slate900, tk.blue600, tk.blue400],
      desc: 'Tailored for corporate loan syndicates, wealth advisors, and prime retail DSA offices.',
      viewUrl: `${import.meta.env.BASE_URL}samples/branded/northstar-finserv.jpg`,
      pdfUrl: `${import.meta.env.BASE_URL}samples/branded/northstar-finserv.pdf`
    },
    {
      name: 'GreenLeaf Loans', bgH: tk.emerald900, initBg: tk.emerald500, init: 'GL', dot: tk.emerald300, initColor: tk.emerald900,
      tName: 'Teal & Green Theme', colors: [tk.emerald900, tk.emerald500, tk.emerald200],
      desc: 'Ideal for agri-fintech, green energy lending, MSME lenders, and mutual fund distributors.',
      viewUrl: `${import.meta.env.BASE_URL}samples/branded/greenleaf-loans.jpg`,
      pdfUrl: `${import.meta.env.BASE_URL}samples/branded/greenleaf-loans.pdf`
    },
    {
      name: 'Apex Capital', bgH: tk.slate800, initBg: tk.amber500, init: 'AC', dot: tk.amber400, initColor: tk.slate900,
      tName: 'Charcoal & Bronze', colors: [tk.slate800, tk.amber600, tk.amber400],
      desc: 'Polished executive design for high-ticket mortgage consultants and Chartered Accountants.',
      viewUrl: `${import.meta.env.BASE_URL}samples/branded/apex-capital.jpg`,
      pdfUrl: `${import.meta.env.BASE_URL}samples/branded/apex-capital.pdf`
    }
  ];

  return (
    <Box id="live-samples" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', maxWidth: 672, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: tk.blue600, mb: 0.5 }}>Portfolio</Box>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 800, color: tk.slate900 }}>Sample Branded Report Themes</Typography>
        <Typography sx={{ fontSize: '0.875rem', color: tk.slate600, mt: 1 }}>
          See how your reports can look. These samples use fictional financial firms. Yours will carry your own logo, palette, and contact links.
        </Typography>
      </Box>

      {/* Cards: 1 column on mobile, all 3 in one row from md up */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 3, md: 2.5, lg: 3 },
          alignItems: 'stretch',
        }}
      >
        {themes.map((t, i) => (
          <Box
            key={i}
            sx={{
              bgcolor: '#fff',
              borderRadius: '1rem',
              border: `1px solid ${tk.slate200}`,
              overflow: 'hidden',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 30px -10px rgba(15, 23, 42, 0.1)' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              minWidth: 0,
            }}
          >
            <Box>
              {/* Brand header */}
              <Box sx={{ bgcolor: t.bgH, p: 2, color: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: 1, bgcolor: t.initBg, color: t.initColor || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem' }}>
                      {t.init}
                    </Box>
                    <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{t.name}</Typography>
                  </Box>
                  <Box sx={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', bgcolor: t.dot }} />
                </Box>
              </Box>

              {/* Details */}
              <Box sx={{ p: { xs: 3, md: 2.5, lg: 3 }, bgcolor: 'rgba(248, 250, 252, 0.5)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, fontSize: '0.875rem', pb: 1, borderBottom: `1px solid ${tk.slate200}` }}>
                  <Typography sx={{ color: tk.slate500, fontSize: 'inherit' }}>Theme</Typography>
                  <Typography sx={{ fontWeight: 700, color: tk.slate800, fontSize: 'inherit', textAlign: 'right' }}>{t.tName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: tk.slate500 }}>Palette:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t.colors.map((c, j) => (
                      <Box key={j} sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: c, border: `1px solid ${tk.slate300}` }} />
                    ))}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.875rem', color: tk.slate600, lineHeight: 1.5 }}>{t.desc}</Typography>
              </Box>
            </Box>

            {/* Buttons pinned to the bottom */}
            <Box sx={{ p: { xs: 3, md: 2.5, lg: 3 }, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                onClick={() => {
                  if (t.pdfUrl) {
                    console.log('Opening viewUrl:', t.pdfUrl);
                    window.open(t.pdfUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    alert('Preview not available yet.');
                  }
                }}
                sx={{ width: '100%', py: 1.5, borderRadius: 3, bgcolor: tk.blue600, color: '#fff', fontWeight: 600, fontSize: '0.875rem', textTransform: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { bgcolor: tk.blue700 } }}
              >
                <span>👁️</span> View sample
              </Button>
              <Button
                component="a"
                href={t.pdfUrl || '#'}
                download={t.pdfUrl ? t.pdfUrl.split('/').pop() : ''}
                onClick={(e) => {
                  if (!t.pdfUrl) {
                    e.preventDefault();
                    alert('PDF download not available yet.');
                  } else {
                    console.log('Downloading pdfUrl:', t.pdfUrl);
                  }
                }}
                sx={{ width: '100%', py: 1.5, borderRadius: 3, border: `1px solid ${tk.slate200}`, bgcolor: '#fff', color: tk.slate700, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { bgcolor: tk.slate50 } }}
              >
                <span>⬇️</span> Download sample PDF
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footnote */}
      <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: tk.slate400, fontStyle: 'italic' }}>
          *Fictional examples created for demonstration. Your reports will feature your unique branding, phone numbers, and color schemes.
        </Typography>
      </Box>
    </Box>
  );
};

export const WorkflowTimeline = () => {
  const steps = [
    { n: 1, color: tk.blue600, title: 'Pay one-time fee', desc: 'Pay ₹2,500 flat via Razorpay or your wallet. Zero monthly fees or recurring charges.' },
    { n: 2, color: tk.blue600, title: 'Onboarding in 1–2 days', desc: `Our dedicated ${BRANDED_REPORT_COPY.slaTime} via WhatsApp or phone call.` },
    { n: 3, color: tk.blue600, title: 'Submit brand assets', desc: 'Share your PNG logo, desired brand colors, contact links, and preferred disclaimer text.' },
    { n: 4, color: tk.emerald600, bgProps: { bgcolor: 'rgba(239, 246, 255, 0.4)', border: `1px solid ${tk.blue200}` }, title: 'Approve & Go Live', desc: 'Includes 2 free revision rounds. Once approved, all future reports export automatically branded!' },
  ];
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '1rem', border: `1px solid ${tk.slate200}`, p: { xs: 3, md: 4 }, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: tk.blue600, mb: 0.5 }}>Fast & Simple</Box>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 800, color: tk.slate900 }}>How It Works</Typography>
        <Typography sx={{ fontSize: '0.875rem', color: tk.slate500, mt: 1 }}>From order to your first branded export in 4 simple milestones.</Typography>
      </Box>

      {/* Steps: 1 col mobile, 2 cols tablet, all 4 in one row on desktop */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: `repeat(${steps.length}, minmax(0, 1fr))`,
          },
          gap: { xs: 2.5, md: 2, lg: 3 },
          alignItems: 'stretch',
        }}
      >
        {steps.map((s, i) => (
          <Box
            key={i}
            sx={{
              position: 'relative',
              bgcolor: tk.slate50,
              borderRadius: 3,
              p: { xs: 3, md: 2.5, lg: 3 },
              border: `1px solid ${tk.slate200}`,
              height: '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              ...(s.bgProps || {}),
            }}
          >
            <Box sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: 2, bgcolor: s.color, color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: 1 }}>
              {s.n}
            </Box>
            <Typography variant="h4" sx={{ fontSize: '1rem', fontWeight: 700, color: tk.slate900 }}>{s.title}</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: tk.slate600, mt: 1, lineHeight: 1.625 }}>{s.desc}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};



export const PricingCard = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom right, #0f172a, #172554)',
        borderRadius: '1.25rem',
        p: { xs: 2.5, md: 3 },
        color: '#fff',
        boxShadow: 3,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top: ribbon + price on the left, features on the right */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          columnGap: { md: 5 },
          rowGap: 2.5,
          alignItems: 'center',
        }}
      >
        {/* LEFT */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0, alignItems: 'flex-start' }}>
          <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, bgcolor: tk.amber400, color: tk.slate950, width: 'fit-content' }}
          >
            ⭐ {BRANDED_REPORT_COPY.mostPopularRibbon} • Pay Once, Brand Forever
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '2.25rem', sm: '2.75rem' }, fontWeight: 900, color: '#fff', lineHeight: 1 }}>₹2,500</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: tk.slate300, fontWeight: 500 }}>one-time setup fee</Typography>
            <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: '9999px', bgcolor: 'rgba(37, 99, 235, 0.6)', color: tk.blue200, fontSize: '0.6875rem', fontWeight: 700 }}>
              One-time
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.8125rem', color: tk.slate300, lineHeight: 1.5, maxWidth: 440 }}>
            Branding setup fee, paid once. Includes template creation, custom assets setup, and automated pipeline integration.
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            minWidth: 0,
            pl: { md: 4 },
            borderLeft: { md: '1px solid rgba(255, 255, 255, 0.12)' },
          }}
        >
          {[
            'Lifetime custom brand template configuration',
            'Logo, palette, contact info & social links integration',
            'Up to 2 complimentary revision rounds with dedicated designer',
            'Instant automated generation for all future credit analyses',
          ].map((text, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <Box component="span" sx={{ color: tk.emerald400, fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, flexShrink: 0 }}>✓</Box>
              <Typography sx={{ fontSize: '0.8125rem', color: tk.slate200, lineHeight: 1.4 }}>{text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Slim note */}
      <Box
        sx={{
          mt: 2.5,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: tk.slate300, lineHeight: 1.4 }}>
          ℹ️ <strong>Note:</strong> AI analysis reports are charged separately at the current platform rate (from your active wallet credits).
        </Typography>
      </Box>
    </Box>
  );
};


