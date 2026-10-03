import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Skeleton, CircularProgress } from '@mui/material';
import { Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokens } from './tokens';
import { customReportService } from './customReportService';
import CustomReportModal from './CustomReportModal';

const CustomReportCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [brandTemplate, setBrandTemplate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadState = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch
      const [requests, brand] = await Promise.all([
        customReportService.listRequests(),
        customReportService.getBrandTemplate(),
      ]);
      const active = requests.find((r) => !['approved', 'cancelled'].includes(r.status));
      setActiveRequest(active || null);
      setBrandTemplate(brand || null);
    } catch (err) {
      setError('Failed to load custom report status.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = (wasSubmitted) => {
    setModalOpen(false);
    if (wasSubmitted) {
      loadState();
    }
  };

  const checklist = [
    "Your logo, colours and company details",
    "Social media and contact links in header and footer",
    "Up to 2 free revision rounds",
    "Approved once, applied to your future reports"
  ];

  if (error) {
    return (
      <Box sx={{ maxWidth: 840, mx: "auto", mt: 4, p: 3, border: `1px solid ${tokens.colors.border}`, borderRadius: '36px', bgcolor: tokens.colors.cardBg }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadState} size="small" sx={{ mt: 1 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 840, mx: "auto", mt: 4 }}>
      <Card
        sx={{
          borderRadius: '36px',
          border: `1px solid ${tokens.colors.border}`,
          boxShadow: tokens.shadows.card,
          bgcolor: tokens.colors.cardBg,
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Pill Badge */}
        <Chip 
          label="Ready in ≤ 7 days" 
          size="small"
          sx={{
            position: 'absolute',
            top: -12,
            right: 24,
            bgcolor: tokens.colors.primary,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
          }}
        />

        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Sparkles size={24} color={tokens.colors.primary} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.text.primary }}>
              Custom Branded Report
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Get your analysis reports with your company name, logo, contact details and social links, prepared by our team and delivered within 7 working days.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {checklist.map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                <Check size={16} color={tokens.colors.status.success.text} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.text.primary, lineHeight: 1.3 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: '24px' }} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, mt: 1 }}>
              {activeRequest ? (
                <>
                  <Chip 
                    label={`Request ${activeRequest.id} Active`} 
                    sx={{ bgcolor: tokens.colors.status.info.bg, color: tokens.colors.status.info.text, fontWeight: 700, borderRadius: '9999px' }} 
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/partner/custom-reports')}
                    sx={{
                      bgcolor: tokens.colors.primary,
                      color: '#fff',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: '9999px',
                      textTransform: 'none',
                      boxShadow: tokens.shadows.primaryButton,
                      '&:hover': { bgcolor: tokens.colors.primaryHover }
                    }}
                  >
                    View request
                  </Button>
                </>
              ) : brandTemplate ? (
                <>
                  <Chip 
                    label="Brand template active" 
                    sx={{ bgcolor: tokens.colors.status.success.bg, color: tokens.colors.status.success.text, fontWeight: 700, borderRadius: '9999px' }} 
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleOpenModal}
                    sx={{
                      bgcolor: tokens.colors.primary,
                      color: '#fff',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: '9999px',
                      textTransform: 'none',
                      boxShadow: tokens.shadows.primaryButton,
                      '&:hover': { bgcolor: tokens.colors.primaryHover }
                    }}
                  >
                    Update branding
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleOpenModal}
                  sx={{
                    bgcolor: tokens.colors.primary,
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: '9999px',
                    textTransform: 'none',
                    boxShadow: tokens.shadows.primaryButton,
                    '&:hover': { bgcolor: tokens.colors.primaryHover }
                  }}
                >
                  Request Custom Report
                </Button>
              )}

              {/* Only show View my requests link if they don't have an active request occupying the button space, or if we just want it to always be there. Spec says: No request -> button + text link. Active request -> chip + button. */}
              {!activeRequest && !brandTemplate && (
                <Button
                  variant="text"
                  onClick={() => navigate('/partner/custom-reports')}
                  sx={{ color: tokens.colors.text.secondary, fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  View my requests &rarr;
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <CustomReportModal 
          open={modalOpen} 
          onClose={(submitted) => handleCloseModal(submitted)} 
          initialData={brandTemplate}
        />
      )}
    </Box>
  );
};

export default CustomReportCard;
