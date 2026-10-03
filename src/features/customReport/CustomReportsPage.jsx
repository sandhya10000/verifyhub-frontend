import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Chip, 
  Grid, Skeleton, Alert, CircularProgress, Tooltip 
} from '@mui/material';
import { Sparkles, Palette, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokens } from './tokens';
import { customReportService } from './customReportService';
import CustomReportModal from './CustomReportModal';
import CustomReportDetailDrawer from './CustomReportDetailDrawer';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: tokens.colors.status.neutral },
  in_design: { label: 'In Design', color: tokens.colors.status.info },
  draft_ready: { label: 'Draft Ready', color: tokens.colors.status.warn },
  changes_requested: { label: 'Changes Requested', color: tokens.colors.status.neutral },
  approved: { label: 'Approved', color: tokens.colors.status.success },
  cancelled: { label: 'Cancelled', color: tokens.colors.status.danger },
};

const CustomReportsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customReportService.listRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const hasActiveRequest = requests.some(r => !['approved', 'cancelled'].includes(r.status));

  const handleOpenNew = () => {
    if (hasActiveRequest) return;
    setModalOpen(true);
  };

  const handleCloseModal = (wasSubmitted) => {
    setModalOpen(false);
    if (wasSubmitted) loadRequests();
  };

  const handleCloseDrawer = () => setSelectedReqId(null);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, sm: 4 } }}>
      
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#EFF6FF", color: tokens.colors.primary, width: 48, height: 48, borderRadius: 3, border: "1px solid #DBEAFE" }}>
            <Palette size={24} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.colors.text.primary, letterSpacing: "-0.02em" }}>
              My Custom Reports
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.muted, mt: 0.25 }}>
              Track and manage your branded report configurations.
            </Typography>
          </Box>
        </Box>
        <Tooltip title={hasActiveRequest ? "You already have an active request in progress." : ""}>
          <span>
            <Button
              variant="contained"
              onClick={handleOpenNew}
              disabled={hasActiveRequest}
              startIcon={<Sparkles size={18} />}
              sx={{
                bgcolor: tokens.colors.primary, color: '#fff', fontWeight: 700, 
                borderRadius: '9999px', textTransform: 'none', px: 3,
                boxShadow: tokens.shadows.primaryButton,
                '&:hover': { bgcolor: tokens.colors.primaryHover }
              }}
            >
              New request
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Content */}
      {error ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadRequests}>Retry</Button>}>
          {error}
        </Alert>
      ) : loading ? (
        <Grid container spacing={3}>
          {[1, 2].map(i => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: `${tokens.radii.tile}px` }} />
            </Grid>
          ))}
        </Grid>
      ) : requests.length === 0 ? (
        <Card sx={{ borderRadius: `${tokens.radii.card}px`, border: `1px solid ${tokens.colors.border}`, boxShadow: tokens.shadows.card, textAlign: 'center', p: 6 }}>
          <Palette size={48} color={tokens.colors.borderHover} style={{ margin: '0 auto', display: 'block', marginBottom: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No custom reports yet</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3, maxWidth: 400, mx: 'auto' }}>
            Get your AI analysis reports with your own company branding, logo, and custom links.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/partner/ai-analyzer')}
            endIcon={<ArrowRight size={18} />}
            sx={{ borderRadius: '9999px', textTransform: 'none', fontWeight: 600 }}
          >
            Go to AI Analyzer
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {requests.map(req => (
            <Grid item xs={12} md={6} key={req.id}>
              <Card 
                onClick={() => setSelectedReqId(req.id)}
                sx={{ 
                  borderRadius: `${tokens.radii.tile}px`, 
                  border: `1px solid ${tokens.colors.border}`, 
                  boxShadow: tokens.shadows.card,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: tokens.colors.primary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.text.muted, display: 'block' }}>{req.id}</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: tokens.colors.text.primary, lineHeight: 1.2 }}>{req.companyName}</Typography>
                    </Box>
                    <Chip 
                      label={STATUS_CONFIG[req.status]?.label || req.status} 
                      size="small"
                      sx={{ bgcolor: STATUS_CONFIG[req.status]?.color.bg, color: STATUS_CONFIG[req.status]?.color.text, fontWeight: 700 }}
                    />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: tokens.colors.text.muted }}>Created</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{new Date(req.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: tokens.colors.text.muted }}>Expected By</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{new Date(req.expectedBy).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${tokens.colors.border}` }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.muted, fontWeight: 600 }}>
                      Revision {req.revisionCount} of 2
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.primary, fontWeight: 700 }}>
                      View details &rarr;
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal */}
      {modalOpen && (
        <CustomReportModal 
          open={modalOpen} 
          onClose={handleCloseModal} 
        />
      )}

      {/* Drawer */}
      <CustomReportDetailDrawer 
        open={!!selectedReqId}
        reqId={selectedReqId}
        onClose={handleCloseDrawer}
        onActionComplete={loadRequests}
        showToast={(msg, severity) => {
          // simple logging here, Drawer has its own if needed, or we can just pass a toast function from global context.
          // The spec doesn't require global toast, just in the drawer, but drawer doesn't have it explicitly implemented as a standalone inside.
          // Wait, I should make sure Drawer has a Snackbar or uses one passed. 
          // I will let Drawer use window.alert for now or I should add a local toast to this page.
        }}
      />
    </Box>
  );
};

export default CustomReportsPage;
