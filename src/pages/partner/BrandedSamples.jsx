import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Eye, Download } from 'lucide-react';
const BASE = `${import.meta.env.BASE_URL || '/'}samples/branded`;

const tk = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  border: '#E2E8F0',
  text: { primary: '#0F172A', secondary: '#334155', muted: '#64748B' },
};

const SAMPLES = [
  {
    id: 'northstar-finserv',
    name: 'Northstar Finserv',
    style: 'Navy & blue theme',
    colors: ['#0B3D91', '#1E88E5', '#FFB703'],
  },
  {
    id: 'greenleaf-loans',
    name: 'GreenLeaf Loans',
    style: 'Teal & green theme',
    colors: ['#0F766E', '#14B8A6', '#FDE047'],
  },
  {
    id: 'apex-capital',
    name: 'Apex Capital',
    style: 'Charcoal & bronze theme',
    colors: ['#1C1917', '#B45309', '#FBBF24'],
  },
];

const BrandedSamples = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, letterSpacing: '0.06em', color: '#475569', textTransform: 'uppercase', display: 'block', mb: 0.5 }}
      >
        SAMPLE BRANDED REPORTS
      </Typography>
      <Typography variant="body2" sx={{ color: tk.text.muted, lineHeight: 1.6 }}>
        See how your report can look. These samples use fictional companies. Yours will carry your own
        logo, colours, contact details and social links.
      </Typography>
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
      {SAMPLES.map((s) => {
        const pdf = `${BASE}/${s.id}.pdf`;
        return (
          <Box
            key={s.id}
            sx={{
              border: `1px solid ${tk.border}`,
              borderRadius: 2.5,
              overflow: 'hidden',
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow .2s, transform .2s',
              '&:hover': { boxShadow: '0 8px 20px rgba(15,23,42,0.10)', transform: 'translateY(-2px)' },
            }}
          >
            {/* Thumbnail (click opens the PDF) */}
            <Box
              component="a"
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${s.name} sample report`}
              sx={{ display: 'block', lineHeight: 0, borderBottom: `1px solid ${tk.border}` }}
            >
              <Box
                component="img"
                src={`${BASE}/${s.id}.jpg`}
                alt={`${s.name} sample report preview`}
                loading="lazy"
                sx={{ width: '100%', aspectRatio: '5 / 4', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              />
            </Box>

            <Box sx={{ p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25, flexGrow: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tk.text.primary }}>{s.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                  {s.colors.map((c) => (
                    <Box key={c} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c, border: '1px solid rgba(15,23,42,0.12)' }} />
                  ))}
                  <Typography sx={{ fontSize: '0.75rem', color: tk.text.muted, ml: 0.5 }}>{s.style}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                <Button
                  component="a"
                  href={pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="contained"
                  startIcon={<Eye size={15} />}
                  sx={{
                    flexGrow: 1,
                    bgcolor: tk.primary,
                    borderRadius: '9999px',
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: tk.primaryHover, boxShadow: 'none' },
                  }}
                >
                  View sample
                </Button>
                <Button
                  component="a"
                  href={pdf}
                  download={`${s.id}-sample-report.pdf`}
                  size="small"
                  variant="outlined"
                  aria-label={`Download ${s.name} sample report`}
                  sx={{
                    minWidth: 0,
                    px: 1.25,
                    borderRadius: '9999px',
                    borderColor: tk.border,
                    color: tk.text.secondary,
                    '&:hover': { borderColor: tk.primary, bgcolor: '#EFF6FF' },
                  }}
                >
                  <Download size={16} />
                </Button>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default BrandedSamples;