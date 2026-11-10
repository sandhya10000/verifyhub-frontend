import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Send, Paperclip } from 'lucide-react';

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Validates picked images (type, 5 MB each, max 3 total). Returns { files, error }.
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

// Ctrl+V handler: clipboard images are attached like picked files; text paste is untouched.
const handlePasteImages = (event, existing, onFiles, onError) => {
  const pasted = getPastedImages(event);
  if (pasted.length === 0) return;
  event.preventDefault();
  const r = pickImages(pasted, existing);
  if (r.error) onError(r.error);
  else onFiles(r.files);
};

const attachmentUrl = (a) => `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${a.url}`;

// One thumbnail. On a load failure (often a stale cached failure within the
// same session) retry with a fresh URL, then show a retry button.
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
import axios from 'axios';
import { format } from 'date-fns';
import { ticketService, getPastedImages } from '../../services/ticketService';
import DataTable from '../../Components/shared/DataTable';
import StatusBadge from '../../Components/shared/StatusBadge';
import RowActions from '../../Components/shared/RowActions';
import FilterBar from '../../Components/shared/FilterBar';
import DownloadIcon from '@mui/icons-material/Download';
import { exportAllToCsv } from '../../utils/exportAll';
import { csvFilename, fileStamp } from '../../utils/csvExport';

const AdminSupport = () => {
  const formatName = (name = "") => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportToast, setExportToast] = useState(null);
  const conversationRef = useRef(null);

  const scrollConversationToBottom = (smooth = false) => {
    const el = conversationRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  // Auto-scroll on open (after Dialog transition mounts content) + on new messages
  useEffect(() => {
    if (!isDialogOpen) return;
    const t1 = setTimeout(() => scrollConversationToBottom(false), 50);
    const t2 = setTimeout(() => scrollConversationToBottom(false), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isDialogOpen, selectedTicket?._id]);

  useEffect(() => {
    if (isDialogOpen) scrollConversationToBottom(true);
  }, [selectedTicket?.messages?.length]);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, search]);

  // Mark all tickets as seen the moment the admin opens this page.
  // This stamps supportLastSeenAt on the backend so the sidebar badge clears.
  useEffect(() => {
    const markSeen = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_BASE_URL}/admin/tickets/mark-seen`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Immediately tell the sidebar to refresh its count (badge → 0)
        window.dispatchEvent(new Event('ticketUpdated'));
      } catch (error) {
        console.error('Failed to mark tickets seen:', error);
      }
    };
    markSeen();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/tickets?status=${statusFilter}&partnerSearch=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleOpenDialog = async (ticket) => {
    // Open immediately with the list copy, then replace it with the fresh ticket
    // so attachments and messages are never stale.
    console.log(ticket)
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status);
    setInternalNotes(ticket.internalNotes || '');
    setReplyText('');
    setReplyFiles([]);
    setIsDialogOpen(true);
    try {
      const data = await ticketService.getTicketById(ticket._id);
      console.log(data)
      if (data.success && data.data) {
        setSelectedTicket(data.data);
        setUpdateStatus(data.data.status);
        setInternalNotes(data.data.internalNotes || '');
      }
    } catch (error) {
      console.error('Failed to refresh ticket:', error);
    }
  };

  const handleSendReply = async () => {
    if ((!replyText.trim() && replyFiles.length === 0) || !selectedTicket) return;
    setSendingReply(true);
    try {
      const data = await ticketService.replyAsAdmin(selectedTicket._id, replyText.trim(), replyFiles);
      if (data.success) {
        setSelectedTicket(data.data);
        setUpdateStatus(data.data.status);
        setReplyText('');
        setReplyFiles([]);
        fetchTickets();
        window.dispatchEvent(new Event('ticketUpdated'));
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTicket(null);
  };

  const handleSaveTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/admin/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateStatus,
          internalNotes
        })
      });

      fetchTickets();
      // Also emit an event to trigger sidebar refresh if we implement that
      window.dispatchEvent(new Event('ticketUpdated'));
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  // Export EVERY ticket matching the current search + status filter — not just
  // the rows the table happens to hold.
  const handleExport = async () => {
    setExporting(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const params = {
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { partnerSearch: search }),
      };

      const nameParts = ['admin_support_tickets'];
      if (statusFilter && statusFilter !== 'all') nameParts.push(statusFilter);
      if (search) nameParts.push(`search_${search}`);
      nameParts.push(fileStamp());

      const { written, truncated } = await exportAllToCsv({
        url: `${API_BASE_URL}/admin/tickets`,
        params,
        headers: { Authorization: `Bearer ${token}` },
        header: [
          'Date', 'Last Updated', 'Partner', 'Email', 'Partner ID', 'Phone',
          'Category', 'Reference', 'Status', 'Subject', 'Messages',
        ],
        mapRow: (t) => [
          t.createdAt ? format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm') : '',
          t.updatedAt ? format(new Date(t.updatedAt), 'MMM dd, yyyy HH:mm') : '',
          formatName(t.partnerId?.name || 'Unknown'),
          t.partnerId?.email || '',
          t.partnerId?.partner_id || '',
          t.partnerId?.phone || '',
          t.category || '',
          t.reference || '',
          t.status || '',
          t.subject || t.title || '',
          (t.messages?.length || 0) + 1,
        ],
        filename: csvFilename(nameParts),
      });

      setExportToast({
        severity: 'success',
        text: truncated
          ? `Exported the first ${written} tickets (50,000 row limit reached).`
          : `Exported ${written} ticket${written === 1 ? '' : 's'} to CSV.`,
      });
    } catch (err) {
      console.error('Failed to export tickets:', err);
      setExportToast({ severity: 'error', text: 'Export failed. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const statusLabel = (s) => {
    if (s === 'in-progress') return 'In Progress';
    if (!s) return '—';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const ticketColumns = [
    {
      header: 'Date', field: 'createdAt', nowrap: true, minWidth: 150,
      render: (t) => (
        <Typography sx={{ fontSize: '0.78rem', color: '#33415C', whiteSpace: 'nowrap' }}>
          {t.createdAt ? format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm') : '—'}
        </Typography>
      ),
    },
    {
      header: 'Partner', field: 'partner', minWidth: 170,
      render: (t) => (
        <Box sx={{ maxWidth: 200 }}>
          <Typography title={t.partnerId?.name} sx={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {formatName(t.partnerId?.name || 'Unknown')}
          </Typography>
          <Typography title={t.partnerId?.email} sx={{ fontSize: '0.7rem', color: '#8A94A6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.partnerId?.email || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      header: 'Partner ID', field: 'partner_id', nowrap: true, minWidth: 110,
      render: (t) => {
        const dbId = t.partnerId?._id || null;
        const pid = t.partnerId?.partner_id || '—';
        const pname = t.partnerId?.name || 'Unknown';
        return dbId && pid !== '—' ? (
          <Tooltip title={`${pname} — open profile, reports & transactions`}>
            <Typography
              component={RouterLink}
              to={`/admin/partners/${dbId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                color: '#3730A3',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {pid}
            </Typography>
          </Tooltip>
        ) : (
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#33415C', whiteSpace: 'nowrap' }}>
            {pid}
          </Typography>
        );
      },
    },
    { header: 'Category', field: 'category', minWidth: 120 },
    {
      header: 'Reference', field: 'reference', nowrap: true, minWidth: 110,
      render: (t) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#33415C', whiteSpace: 'nowrap' }}>
          {t.reference || '–'}
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
        <RowActions actions={[{ label: `Open conversation (${(t.messages?.length || 0) + 1})`, onClick: () => handleOpenDialog(t) }]} />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Tickets</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exporting}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {exporting ? 'Exporting…' : 'Export to Sheets'}
        </Button>
      </Box>

      <FilterBar
        search={{
          value: search,
          onChange: (v) => setSearch(v),
          placeholder: 'Search by partner name, email or ID…',
        }}
        selects={[{
          name: 'status', label: 'Status', value: statusFilter, minWidth: 160,
          options: [
            { value: 'all', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
          ],
          onChange: (v) => setStatusFilter(v),
        }]}
      />

      <DataTable
        title="Tickets"
        columns={ticketColumns}
        data={tickets}
        emptyMessage="No tickets found."
      />

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        Export to Sheets downloads every ticket matching the search and status above.
      </Typography>

      <Snackbar
        open={Boolean(exportToast)}
        autoHideDuration={5000}
        onClose={() => setExportToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={exportToast?.severity || 'error'} onClose={() => setExportToast(null)} sx={{ width: '100%' }}>
          {exportToast?.text || ''}
        </Alert>
      </Snackbar>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth TransitionProps={{ onEntered: () => scrollConversationToBottom(false) }}>
        {selectedTicket && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Ticket Details
              <Typography variant="subtitle2" color="text.secondary">
                Submitted by {formatName(selectedTicket.partnerId?.name)} on {format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">Category</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedTicket.category}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">Reference ID</Typography>
                <Typography variant="body1">{selectedTicket.reference || 'N/A'}</Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" color="text.secondary">Description</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mt: 1 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.description}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" color="text.secondary">Conversation ({(selectedTicket.messages?.length || 0) + 1})</Typography>
                <Paper ref={conversationRef} variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default', maxHeight: 280, overflowY: 'auto' }}>
                  {/* Initial partner message — always first in thread */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.25 }}>
                    <Box sx={{ maxWidth: '85%', bgcolor: 'background.paper', color: 'text.primary', px: 1.75, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600 }}>
                        {selectedTicket.partnerId?.name || 'Partner'} · {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM dd HH:mm') : ''}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{selectedTicket.description}</Typography>
                      <AttachmentGrid attachments={selectedTicket.attachments} />
                    </Box>
                  </Box>
                  {(selectedTicket.messages || []).map((m, i) => {
                      const isAdminMsg = m.senderRole === 'admin';
                      return (
                        <Box key={m._id || i} sx={{ display: 'flex', justifyContent: isAdminMsg ? 'flex-end' : 'flex-start', mb: 1.25 }}>
                          <Box sx={{ maxWidth: '85%', bgcolor: isAdminMsg ? 'primary.main' : 'background.paper', color: isAdminMsg ? 'primary.contrastText' : 'text.primary', px: 1.75, py: 1, borderRadius: 2, border: isAdminMsg ? 'none' : '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600 }}>
                              {isAdminMsg ? `You${m.sender?.name ? ` · ${m.sender.name}` : ''}` : `${selectedTicket.partnerId?.name || 'Partner'}`} · {m.createdAt ? format(new Date(m.createdAt), 'MMM dd HH:mm') : ''}
                            </Typography>
                            {m.text && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{m.text}</Typography>}
                            <AttachmentGrid attachments={m.attachments} />
                          </Box>
                        </Box>
                      );
                    })}
                </Paper>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <Button component="label" size="small" aria-label="Attach images" disabled={replyFiles.length >= MAX_IMAGES} sx={{ minWidth: 0, p: 1, borderRadius: 2 }}>
                    <Paperclip size={18} />
                    <input hidden type="file" accept="image/png,image/jpeg,image/webp" multiple
                      onChange={(e) => {
                        const r = pickImages(e.target.files, replyFiles);
                        if (r.error) alert(r.error);
                        else setReplyFiles(r.files);
                        e.target.value = '';
                      }} />
                  </Button>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={replyFiles.length ? `${replyFiles.length} image(s) attached` : 'Type a reply to partner...'}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onPaste={(e) => handlePasteImages(e, replyFiles, setReplyFiles, (msg) => alert(msg))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button variant="contained" onClick={handleSendReply} disabled={(!replyText.trim() && replyFiles.length === 0) || sendingReply} startIcon={<Send size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Reply
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Internal Notes"
                  multiline
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add notes for admins (not visible to partner)..."
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
              <Button onClick={handleSaveTicket} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminSupport;
