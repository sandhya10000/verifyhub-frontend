import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ticketService } from '../../services/ticketService';

const getStatusColor = (status) => {
  switch (status) {
    case 'open': return 'error';
    case 'in-progress': return 'warning';
    case 'resolved': return 'success';
    default: return 'default';
  }
};

const Support = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({ category: '', reference: '', description: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Thread state
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const threadEndRef = useRef(null);
  const conversationRef = useRef(null);

  const scrollConversationToBottom = (smooth = false) => {
    const el = conversationRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    else threadEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const categories = [
    "Wallet — recharge not credited",
    "Report generation issue",
    "Billing query",
    "Other"
  ];

  const fetchMyTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await ticketService.getMyTickets();
      if (data.success) setTickets(data.data);
    } catch {
      // silent — ticket list is secondary to raise-ticket form
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => { fetchMyTickets(); }, []);

  // Poll open thread every 15s
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!threadOpen || !selectedTicket) return;
    const t = setInterval(async () => {
      try {
        const data = await ticketService.getMyTicket(selectedTicket._id);
        if (data.success) setSelectedTicket(data.data);
      } catch { /* ignore */ }
    }, 15000);
    return () => clearInterval(t);
  }, [threadOpen, selectedTicket?._id]);

  // Auto-scroll to newest on open (after Dialog transition) + on new messages
  useEffect(() => {
    if (!threadOpen) return;
    const t1 = setTimeout(() => scrollConversationToBottom(false), 50);
    const t2 = setTimeout(() => scrollConversationToBottom(false), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [threadOpen, selectedTicket?._id]);

  useEffect(() => {
    if (threadOpen) scrollConversationToBottom(true);
  }, [selectedTicket?.messages?.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await ticketService.createTicket({
        category: formData.category,
        reference: formData.reference,
        description: formData.description
      });
      setToast({ open: true, message: 'Ticket submitted successfully! We will get back to you shortly.', severity: 'success' });
      setFormData({ category: '', reference: '', description: '' });
      fetchMyTickets();
    } catch {
      setToast({ open: true, message: 'Failed to submit ticket. Please try again.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openThread = async (ticket) => {
    try {
      const data = await ticketService.getMyTicket(ticket._id);
      setSelectedTicket(data.success ? data.data : ticket);
    } catch {
      setSelectedTicket(ticket);
    }
    setReplyText('');
    setThreadOpen(true);
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      const data = await ticketService.replyAsPartner(selectedTicket._id, replyText.trim());
      if (data.success) {
        setSelectedTicket(data.data);
        setReplyText('');
        fetchMyTickets();
      }
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || 'Failed to send reply.', severity: 'error' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Support</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Raise a ticket for wallet, report or API issues — most tickets close within 4 working hours.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3, alignItems: 'stretch' }}>
        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(15,27,45,.05)', minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Reach Us</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>WHATSAPP</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>+91 99107 37470</Typography>
            </Box>
            <Divider />
            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>EMAIL</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>info@verifyhub.in</Typography>
            </Box>
            <Divider />
            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>HOURS</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Mon–Sat · 9:30 AM – 7:00 PM IST</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(15,27,45,.05)', minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Raise a Ticket</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField select fullWidth label="Category" name="category" value={formData.category} onChange={handleInputChange} error={!!errors.category} helperText={errors.category} InputProps={{ sx: { borderRadius: 2 } }}>
              {categories.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
            </TextField>
            <TextField fullWidth label="Reference (Txn ID / PAN, optional)" name="reference" placeholder="TXN-88395" value={formData.reference} onChange={handleInputChange} InputProps={{ sx: { borderRadius: 2 } }} />
            <TextField fullWidth multiline rows={4} label="Describe the issue" name="description" placeholder="Tell us what happened..." value={formData.description} onChange={handleInputChange} error={!!errors.description} helperText={errors.description} InputProps={{ sx: { borderRadius: 2 } }} />
            <Box sx={{ mt: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ py: 1.5, px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '1rem' }}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* My tickets + conversation */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(15,27,45,.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MessageCircle size={20} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>My Tickets</Typography>
        </Box>
        {loadingTickets ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : tickets.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No tickets yet. Raise one above and the conversation will appear here.</Typography>
        ) : isMobile ? (
          /* ── Mobile stacked cards ──────────────────────────────────── */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {tickets.map((t) => (
              <Box
                key={t._id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25, pb: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', flexShrink: 0, mr: 2 }}>Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
                    {t.createdAt ? format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                  </Typography>
                </Box>

                {/* Category */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25, pb: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', flexShrink: 0, mr: 2 }}>Category</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>
                    {t.category}
                  </Typography>
                </Box>

                {/* Reference */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, pb: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', flexShrink: 0, mr: 2 }}>Reference</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                    {t.reference || '-'}
                  </Typography>
                </Box>

                {/* Status + Replies on the same row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={t.status.toUpperCase()}
                    color={getStatusColor(t.status)}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                  <IconButton
                    color="primary"
                    title="Open conversation"
                    onClick={() => openThread(t)}
                    sx={{ borderRadius: 2 }}
                  >
                    <Badge
                      badgeContent={(t.messages?.length || 0) + 1}
                      color="primary"
                      max={99}
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18, fontWeight: 700 } }}
                    >
                      <MessageCircle size={22} />
                    </Badge>
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          /* ── Desktop table ─────────────────────────────────────────── */
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>Replies</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.75 }}>{t.createdAt ? format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm') : '-'}</TableCell>
                    <TableCell sx={{ py: 1.75 }}>{t.category}</TableCell>
                    <TableCell sx={{ py: 1.75 }}>{t.reference || '-'}</TableCell>
                    <TableCell sx={{ py: 1.75 }}>
                      <Chip label={t.status.toUpperCase()} color={getStatusColor(t.status)} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.75 }}>
                      <IconButton color="primary" title="Open conversation" onClick={() => openThread(t)} sx={{ borderRadius: 2 }}>
                        <Badge badgeContent={(t.messages?.length || 0) + 1} color="primary" max={99} overlap="circular" anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18, fontWeight: 700 } }}>
                          <MessageCircle size={22} />
                        </Badge>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Thread dialog */}
      <Dialog open={threadOpen} onClose={() => setThreadOpen(false)} maxWidth="sm" fullWidth TransitionProps={{ onEntered: () => scrollConversationToBottom(false) }}>
        {selectedTicket && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {selectedTicket.category}
              <Typography variant="subtitle2" color="text.secondary">
                {selectedTicket.reference ? `${selectedTicket.reference} · ` : ''}{selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm') : ''} · {selectedTicket.status?.toUpperCase()}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: 'background.default', maxHeight: '60vh', overflowY: 'auto' }} ref={conversationRef}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <Box sx={{ maxWidth: '80%', bgcolor: 'primary.main', color: 'primary.contrastText', px: 2, py: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600 }}>
                    You · {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM dd HH:mm') : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{selectedTicket.description}</Typography>
                </Box>
              </Box>
              {(selectedTicket.messages || []).map((m, i) => {
                const mine = m.senderRole !== 'admin';
                return (
                  <Box key={m._id || i} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                    <Box sx={{ maxWidth: '80%', bgcolor: mine ? 'primary.main' : 'background.paper', color: mine ? 'primary.contrastText' : 'text.primary', px: 2, py: 1.25, borderRadius: 2, border: mine ? 'none' : '1px solid', borderColor: 'divider', boxShadow: mine ? 'none' : '0 2px 8px rgba(15,27,45,.05)' }}>
                      <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600 }}>
                        {mine ? 'You' : `Support${m.sender?.name ? ` · ${m.sender.name}` : ''}`} · {m.createdAt ? format(new Date(m.createdAt), 'MMM dd HH:mm') : ''}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{m.text}</Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={threadEndRef} />
              {selectedTicket.status === 'resolved' && (
                <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }}>Ticket resolved. Please raise a new ticket for further help.</Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              {selectedTicket.status !== 'resolved' ? (
                <>
                  <TextField fullWidth size="small" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <Button variant="contained" onClick={handleReply} disabled={!replyText.trim() || sendingReply} startIcon={sendingReply ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Reply
                  </Button>
                </>
              ) : (
                <Button onClick={() => setThreadOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Close</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Support;
