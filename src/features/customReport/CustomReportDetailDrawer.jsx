import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Button, CircularProgress, 
  Chip, Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, TextField, Divider, Avatar, useMediaQuery, useTheme,
  Snackbar, Alert
} from '@mui/material';
import { X, Send, AlertCircle, Palette } from 'lucide-react';
import { tokens } from './tokens';
import { customReportService } from './customReportService';
import { config } from './config';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: tokens.colors.status.neutral },
  in_design: { label: 'In Design', color: tokens.colors.status.info },
  draft_ready: { label: 'Draft Ready', color: tokens.colors.status.warn },
  changes_requested: { label: 'Changes Requested', color: tokens.colors.status.neutral },
  approved: { label: 'Approved', color: tokens.colors.status.success },
  cancelled: { label: 'Cancelled', color: tokens.colors.status.danger },
};

const STEPS = ['submitted', 'in_design', 'draft_ready', 'approved'];

const DraftPreview = ({ data }) => {
  return (
    <Box sx={{ border: `1px solid ${tokens.colors.border}`, borderRadius: `${tokens.radii.tile}px`, overflow: 'hidden', mt: 2 }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: `2px solid ${data.brandColors?.primary || tokens.colors.primary}` }}>
        <img src={data.logo} alt="Logo" style={{ maxHeight: 40 }} />
        {data.tagline && <Typography variant="caption" sx={{ fontStyle: 'italic', color: data.brandColors?.secondary || tokens.colors.text.secondary }}>{data.tagline}</Typography>}
      </Box>
      {/* Body */}
      <Box sx={{ p: 4, bgcolor: '#fdfdfd' }}>
        <Typography variant="h6" sx={{ color: data.brandColors?.primary || tokens.colors.primary, mb: 1, fontWeight: 700 }}>
          Credit Analysis Report
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>Prepared for John Doe</Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, opacity: 0.6 }}>
          {data.preferences?.sections?.executive && <Box sx={{ height: 60, bgcolor: tokens.colors.background, borderRadius: 1, p: 1 }}><Typography variant="caption">Executive Summary Mock</Typography></Box>}
          {data.preferences?.sections?.risk && <Box sx={{ height: 60, bgcolor: tokens.colors.background, borderRadius: 1, p: 1 }}><Typography variant="caption">Risk Factors Mock</Typography></Box>}
          {data.preferences?.sections?.account && <Box sx={{ height: 60, bgcolor: tokens.colors.background, borderRadius: 1, p: 1 }}><Typography variant="caption">Account Health Mock</Typography></Box>}
          {data.preferences?.sections?.plan && <Box sx={{ height: 60, bgcolor: tokens.colors.background, borderRadius: 1, p: 1 }}><Typography variant="caption">90-Day Plan Mock</Typography></Box>}
        </Box>
      </Box>
      {/* Footer */}
      <Box sx={{ p: 2, bgcolor: data.brandColors?.secondary || tokens.colors.text.primary, color: '#fff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{data.companyName}</Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>{data.contact?.email}</Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>{data.contact?.phone}</Typography>
          </Box>
          <Box sx={{ maxWidth: '50%' }}>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, fontSize: '0.65rem' }}>
              {data.preferences?.disclaimer}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CustomReportDetailDrawer = ({ open, reqId, onClose, onActionComplete, showToast }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [newComment, setNewComment] = useState('');
  
  // Dialogs
  const [cancelOpen, setCancelOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionText, setRevisionText] = useState('');

  const loadData = async () => {
    if (!reqId) return;
    setLoading(true);
    try {
      const data = await customReportService.getRequest(reqId);
      setReq(data);
    } catch (err) {
      setToast({ open: true, message: 'Failed to load request details.', severity: 'error' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && reqId) loadData();
    else setReq(null);
  }, [open, reqId]);

  const runAction = async (actionFn, successMsg) => {
    setActionLoading(true);
    try {
      await actionFn();
      await loadData();
      setToast({ open: true, message: successMsg, severity: 'success' });
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setToast({ open: true, message: err.message || 'Action failed', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    runAction(() => customReportService.cancel(reqId), 'Request cancelled.');
    setCancelOpen(false);
  };

  const handleApprove = () => {
    runAction(() => customReportService.approve(reqId), 'Brand template approved and active!');
    setApproveOpen(false);
  };

  const handleRequestChanges = () => {
    if (revisionText.length < 10 || revisionText.length > 1000) {
      setToast({ open: true, message: 'Comment must be between 10 and 1000 characters.', severity: 'error' });
      return;
    }
    runAction(() => customReportService.requestChanges(reqId, revisionText), 'Changes requested.');
    setRevisionOpen(false);
    setRevisionText('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    runAction(() => customReportService.addComment(reqId, newComment), 'Comment added.');
    setNewComment('');
  };

  // Dev Helpers
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  
  const handleDevSimulate = (type) => {
    runAction(() => customReportService.simulateTeamAction(reqId, type), `Dev: Simulated ${type}`);
  };

  if (!open) return null;

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { width: fullScreen ? '100%' : 600, bgcolor: tokens.colors.background } }}
      aria-labelledby="drawer-title"
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', borderBottom: `1px solid ${tokens.colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <Typography id="drawer-title" variant="h6" sx={{ fontWeight: 700 }}>
          {req ? `Request ${req.id}` : 'Loading...'}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close drawer"><X size={20} /></IconButton>
      </Box>

      {loading || !req ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Status Tracker */}
          <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: `${tokens.radii.tile}px`, border: `1px solid ${tokens.colors.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Chip 
                label={STATUS_CONFIG[req.status]?.label || req.status} 
                sx={{ bgcolor: STATUS_CONFIG[req.status]?.color.bg, color: STATUS_CONFIG[req.status]?.color.text, fontWeight: 700 }} 
                size="small" 
              />
              <Typography variant="caption" sx={{ color: tokens.colors.text.muted }}>
                Expected by: {new Date(req.expectedBy).toLocaleDateString()}
              </Typography>
            </Box>
            
            {req.status === 'cancelled' ? (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>This request was cancelled.</Typography>
            ) : (
              <Box sx={{ display: 'flex', mt: 3, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 10, left: '10%', right: '10%', height: 2, bgcolor: tokens.colors.border, zIndex: 0 }} />
                {STEPS.map((step, idx) => {
                  const isCompleted = STEPS.indexOf(req.status) >= idx || (req.status === 'changes_requested' && idx <= 1);
                  const isCurrent = req.status === step || (req.status === 'changes_requested' && step === 'in_design');
                  return (
                    <Box key={step} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: isCompleted ? tokens.colors.primary : '#fff', border: `2px solid ${isCompleted ? tokens.colors.primary : tokens.colors.border}` }} />
                      <Typography variant="caption" sx={{ mt: 1, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? tokens.colors.text.primary : tokens.colors.text.muted, textAlign: 'center', fontSize: '0.65rem' }}>
                        {STATUS_CONFIG[step].label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Draft Preview if available */}
          {['draft_ready', 'changes_requested', 'approved'].includes(req.status) && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Draft Preview</Typography>
              <DraftPreview data={req} />
            </Box>
          )}

          {/* Details */}
          <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: `${tokens.radii.tile}px`, border: `1px solid ${tokens.colors.border}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Submitted Details</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <img src={req.logo} alt="Logo" style={{ maxHeight: 40 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.companyName}</Typography>
            </Box>
            <Typography variant="body2"><Box component="span" sx={{ color: tokens.colors.text.muted, width: 80, display: 'inline-block' }}>Email:</Box> {req.contact.email}</Typography>
            <Typography variant="body2"><Box component="span" sx={{ color: tokens.colors.text.muted, width: 80, display: 'inline-block' }}>Language:</Box> {req.preferences.language}</Typography>
            {req.tagline && <Typography variant="body2"><Box component="span" sx={{ color: tokens.colors.text.muted, width: 80, display: 'inline-block' }}>Tagline:</Box> {req.tagline}</Typography>}
          </Box>

          {/* Actions */}
          {!['approved', 'cancelled'].includes(req.status) && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {req.status === 'draft_ready' && (
                <>
                  <Button 
                    variant="contained" 
                    onClick={() => setApproveOpen(true)} 
                    disabled={actionLoading}
                    sx={{ bgcolor: tokens.colors.primary, color: '#fff', borderRadius: '9999px', textTransform: 'none', px: 3 }}
                  >
                    Approve Brand
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setRevisionOpen(true)} 
                    disabled={actionLoading}
                    sx={{ borderRadius: '9999px', textTransform: 'none', px: 3 }}
                  >
                    Request Changes ({req.revisionCount}/{config.MAX_REVISIONS})
                  </Button>
                </>
              )}
              {req.status === 'submitted' && (
                <Button 
                  variant="text" 
                  color="error" 
                  onClick={() => setCancelOpen(true)} 
                  disabled={actionLoading}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel Request
                </Button>
              )}
            </Box>
          )}

          {/* Comments */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Activity & Comments</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {req.comments.map(c => (
                <Box key={c.id} sx={{ display: 'flex', gap: 1.5, flexDirection: c.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: c.sender === 'user' ? tokens.colors.primary : tokens.colors.text.muted, fontSize: '0.875rem' }}>
                    {c.sender === 'user' ? 'U' : 'VH'}
                  </Avatar>
                  <Box sx={{ 
                    p: 1.5, borderRadius: 2, 
                    bgcolor: c.sender === 'user' ? tokens.colors.status.info.bg : '#fff',
                    border: c.sender === 'team' ? `1px solid ${tokens.colors.border}` : 'none',
                    maxWidth: '80%'
                  }}>
                    <Typography variant="body2">{c.text}</Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.muted, display: 'block', mt: 0.5, textAlign: c.sender === 'user' ? 'right' : 'left' }}>
                      {new Date(c.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {!['approved', 'cancelled'].includes(req.status) && (
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <TextField 
                  size="small" 
                  fullWidth 
                  placeholder="Add a comment..." 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)} 
                  disabled={actionLoading}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || actionLoading}
                  sx={{ bgcolor: tokens.colors.status.info.bg }}
                >
                  <Send size={18} />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* DEV HELPER */}
          {isDev && (
            <Box sx={{ mt: 4, p: 2, border: '2px dashed #9333ea', borderRadius: 2, bgcolor: '#faf5ff' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#9333ea', display: 'block', mb: 1 }}>
                DEV ONLY: Simulate Team
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" color="secondary" onClick={() => handleDevSimulate('in_design')}>&rarr; In Design</Button>
                <Button size="small" variant="outlined" color="secondary" onClick={() => handleDevSimulate('draft_ready')}>&rarr; Draft Ready</Button>
                <Button size="small" variant="outlined" color="secondary" onClick={() => handleDevSimulate('reply')}>+ Team Reply</Button>
              </Box>
            </Box>
          )}

        </Box>
      )}

      {/* Dialogs */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>Cancel Request?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to cancel this custom report request?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>No, keep it</Button>
          <Button onClick={handleCancel} color="error" variant="contained">Yes, cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)}>
        <DialogTitle>Approve Brand Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your branded template is now active. It will be applied to your future AI analysis reports.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveOpen(false)}>Wait, go back</Button>
          <Button onClick={handleApprove} variant="contained" sx={{ bgcolor: tokens.colors.primary }}>Confirm Approval</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={revisionOpen} onClose={() => setRevisionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Changes</DialogTitle>
        <DialogContent>
          {req?.revisionCount >= config.MAX_REVISIONS ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.colors.status.danger.text, p: 2, bgcolor: tokens.colors.status.danger.bg, borderRadius: 2 }}>
              <AlertCircle size={20} />
              <Typography variant="body2">You've used your free revision rounds. Please contact support for further changes.</Typography>
            </Box>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Please describe the changes you'd like (10 - 1000 characters). This is revision {req?.revisionCount + 1} of {config.MAX_REVISIONS}.
              </DialogContentText>
              <TextField
                autoFocus
                multiline
                rows={4}
                fullWidth
                value={revisionText}
                onChange={e => setRevisionText(e.target.value)}
                placeholder="E.g., Please make the primary color slightly darker, and use this updated tagline..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRevisionOpen(false); setRevisionText(''); }}>Cancel</Button>
          <Button 
            onClick={handleRequestChanges} 
            variant="contained" 
            disabled={req?.revisionCount >= config.MAX_REVISIONS || revisionText.length < 10 || revisionText.length > 1000}
          >
            Submit Revision
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Drawer>
  );
};

export default CustomReportDetailDrawer;
