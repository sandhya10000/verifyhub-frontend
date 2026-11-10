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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Send, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { ticketService, getPastedImages } from '../../services/ticketService';
import DataTable from '../../Components/shared/DataTable';
import StatusBadge from '../../Components/shared/StatusBadge';
import RowActions from '../../Components/shared/RowActions';

const statusLabel = (s) => {
  if (s === 'in-progress') return 'In Progress';
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const makeSupportId = () => String(Math.floor(100000 + Math.random() * 900000));

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Picks images from a file input, enforcing type, size and count limits.
// Returns { files, error } so the caller can show a single message.
const pickImages = (fileList, existing) => {
  const picked = [];
  for (const f of Array.from(fileList || [])) {
    if (!IMAGE_TYPES.includes(f.type)) return { files: existing, error: 'Only PNG, JPG or WebP images can be attached.' };
    if (f.size > MAX_IMAGE_BYTES) return { files: existing, error: `"${f.name}" is larger than 5 MB.` };
    picked.push(f);
  }
  const merged = [...existing, ...picked];
  if (merged.length > MAX_IMAGES) return { files: existing, error: `You can attach up to ${MAX_IMAGES} images.` };
  return { files: merged, error: '' };
};

// Ctrl+V handler for text fields: images on the clipboard are attached like picked files,
// while plain-text paste falls through untouched.
const handlePasteImages = (event, existing, onFiles, onError) => {
  const pasted = getPastedImages(event);
  if (pasted.length === 0) return;
  event.preventDefault();
  const r = pickImages(pasted, existing);
  if (r.error) onError(r.error);
  else onFiles(r.files);
};

const attachmentUrl = (a) => `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${a.url}`;

// One thumbnail. If the browser fails to load it (often a stale cached failure
// within the same session), retry with a fresh URL before showing a retry button.
const AttachmentImage = ({ attachment }) => {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const base = attachmentUrl(attachment);
  const src = attempt === 0 ? base : `${base}?r=${attempt}&t=${Date.now()}`;

  if (failed) {
    return (
      <Box component="button" type="button" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }}
        sx={{ width: 96, height: 96, borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent', cursor: 'pointer', fontSize: '0.7rem', color: 'inherit' }}>
        Image unavailable · Retry
      </Box>
    );
  }
  return (
    <Box component="a" href={base} target="_blank" rel="noopener noreferrer"
      sx={{ display: 'block', width: 96, height: 96, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <img src={src} alt={attachment.filename || 'attachment'} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => {
          if (attempt < 2) setTimeout(() => setAttempt((n) => n + 1), 800);
          else setFailed(true);
        }} />
    </Box>
  );
};

// Thumbnails for a message/ticket. Clicking opens the full image in a new tab.
const AttachmentGrid = ({ attachments }) => {
  if (!attachments?.length) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.75 }}>
      {attachments.map((a, i) => (
        <AttachmentImage key={a.url || i} attachment={a} />
      ))}
    </Box>
  );
};

const Support = () => {
  const [formData, setFormData] = useState({ category: '', reference: makeSupportId(), description: '' });
  const [files, setFiles] = useState([]);
  const [replyFiles, setReplyFiles] = useState([]);
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

  // Mark admin replies as seen the moment the partner opens this page.
  // This stamps supportLastSeenAt on the backend so the sidebar badge clears.
  useEffect(() => {
    const markSeen = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_BASE_URL}/tickets/mark-seen`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Immediately tell the sidebar to refresh its count (badge → 0)
        window.dispatchEvent(new Event('ticketUpdated'));
      } catch {
        // silent — badge clearing is non-critical
      }
    };
    markSeen();
  }, []);

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
        description: formData.description,
        files,
      });
      setToast({ open: true, message: 'Ticket submitted successfully! We will get back to you shortly.', severity: 'success' });
      setFormData({ category: '', reference: makeSupportId(), description: '' });
      setFiles([]);
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
    setReplyFiles([]);
    setThreadOpen(true);
  };

  const handleReply = async () => {
    if ((!replyText.trim() && replyFiles.length === 0) || !selectedTicket) return;
    setSendingReply(true);
    try {
      const data = await ticketService.replyAsPartner(selectedTicket._id, replyText.trim(), replyFiles);
      if (data.success) {
        setSelectedTicket(data.data);
        setReplyText('');
        setReplyFiles([]);
        fetchMyTickets();
      }
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || 'Failed to send reply.', severity: 'error' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));

  const ticketColumns = [
    {
      header: 'Date', field: 'createdAt', nowrap: true, minWidth: 150,
      render: (t) => (
        <Typography sx={{ fontSize: '0.78rem', color: '#33415C', whiteSpace: 'nowrap' }}>
          {t.createdAt ? format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
        </Typography>
      ),
    },
    { header: 'Category', field: 'category', minWidth: 160 },
    {
      header: 'Reference', field: 'reference', nowrap: true, minWidth: 110,
      render: (t) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#33415C', whiteSpace: 'nowrap' }}>
          {t.reference || '-'}
        </Typography>
      ),
    },
    {
      header: 'Status', field: 'status', nowrap: true, minWidth: 110,
      render: (t) => <StatusBadge status={statusLabel(t.status)} />,
    },
    {
      header: 'Actions', field: 'actions', align: 'right', width: 60,
      render: (t) => (
        <RowActions actions={[{ label: `Open conversation (${(t.messages?.length || 0) + 1})`, onClick: () => openThread(t) }]} />
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Support</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Raise a ticket for wallet, report or API issues — most tickets close within 4 working hours.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3, alignItems: 'stretch' }}>
        <Paper sx={{ p: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(15,27,45,.05)', minWidth: 0 }}>
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

        <Paper sx={{ p: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(15,27,45,.05)', minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Raise a Ticket</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField select fullWidth label="Category" name="category" value={formData.category} onChange={handleInputChange} error={!!errors.category} helperText={errors.category} InputProps={{ sx: { borderRadius: 1 } }}>
              {categories.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
            </TextField>
            <TextField fullWidth label="Support ID" name="reference" value={formData.reference} disabled helperText="Auto-generated for this ticket" InputProps={{ sx: { borderRadius: 1 } }} />
            <TextField fullWidth multiline rows={4} label="Describe the issue" name="description" placeholder="Tell us what happened... (you can paste a screenshot with Ctrl+V)" value={formData.description} onChange={handleInputChange} onPaste={(e) => handlePasteImages(e, files, setFiles, (msg) => setToast({ open: true, message: msg, severity: 'error' }))} error={!!errors.description} helperText={errors.description} InputProps={{ sx: { borderRadius: 1 } }} />
            <Box>
              <Button component="label" variant="outlined" startIcon={<Paperclip size={16} />} disabled={files.length >= MAX_IMAGES} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                Attach Images
                <input hidden type="file" accept="image/png,image/jpeg,image/webp" multiple
                  onChange={(e) => {
                    const r = pickImages(e.target.files, files);
                    if (r.error) setToast({ open: true, message: r.error, severity: 'error' });
                    else setFiles(r.files);
                    e.target.value = '';
                  }} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Attach or paste (Ctrl+V) · PNG, JPG or WebP · up to {MAX_IMAGES} images · 5 MB each</Typography>
              {files.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {files.map((f, i) => (
                    <Box key={`${f.name}-${i}`} sx={{ position: 'relative', width: 72, height: 72, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Box component="button" type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} aria-label="Remove image"
                        sx={{ position: 'absolute', top: 2, right: 2, p: 0.25, border: 0, borderRadius: '50%', bgcolor: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                        <X size={12} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ py: 1.5, px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '1rem' }}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* My tickets */}
      {loadingTickets ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <DataTable
            title="My Tickets"
            columns={ticketColumns}
            data={tickets}
            emptyMessage="No tickets yet. Raise one above and the conversation will appear here."
          />
        </Box>
      )}

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
                  <AttachmentGrid attachments={selectedTicket.attachments} />
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
                      {m.text && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{m.text}</Typography>}
                      <AttachmentGrid attachments={m.attachments} />
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
                <Box sx={{ width: '100%' }}>
                  {replyFiles.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {replyFiles.map((f, i) => (
                        <Box key={`${f.name}-${i}`} sx={{ position: 'relative', width: 56, height: 56, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Box component="button" type="button" onClick={() => setReplyFiles((prev) => prev.filter((_, j) => j !== i))} aria-label="Remove image"
                            sx={{ position: 'absolute', top: 2, right: 2, p: 0.25, border: 0, borderRadius: '50%', bgcolor: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                            <X size={10} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button component="label" size="small" sx={{ minWidth: 0, p: 1, borderRadius: 2 }} disabled={replyFiles.length >= MAX_IMAGES} aria-label="Attach images">
                    <Paperclip size={18} />
                    <input hidden type="file" accept="image/png,image/jpeg,image/webp" multiple
                      onChange={(e) => {
                        const r = pickImages(e.target.files, replyFiles);
                        if (r.error) setToast({ open: true, message: r.error, severity: 'error' });
                        else setReplyFiles(r.files);
                        e.target.value = '';
                      }} />
                  </Button>
                  <TextField fullWidth size="small" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onPaste={(e) => handlePasteImages(e, replyFiles, setReplyFiles, (msg) => setToast({ open: true, message: msg, severity: 'error' }))} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <Button variant="contained" onClick={handleReply} disabled={(!replyText.trim() && replyFiles.length === 0) || sendingReply} startIcon={sendingReply ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Reply
                  </Button>
                  </Box>
                </Box>
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
