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
  InputLabel
} from '@mui/material';
import { Send } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ticketService } from '../../services/ticketService';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import RowActions from '../../components/shared/RowActions';
import FilterBar from '../../components/shared/FilterBar';

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
  const [sendingReply, setSendingReply] = useState(false);
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

  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status);
    setInternalNotes(ticket.internalNotes || '');
    setReplyText('');
    setIsDialogOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      const data = await ticketService.replyAsAdmin(selectedTicket._id, replyText.trim());
      if (data.success) {
        setSelectedTicket(data.data);
        setUpdateStatus(data.data.status);
        setReplyText('');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Tickets</Typography>
      </Box>

      <FilterBar
        search={{
          value: search,
          onChange: (v) => setSearch(v),
          placeholder: 'Search by partner name or email…',
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
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>{m.text}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                </Paper>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a reply to partner..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button variant="contained" onClick={handleSendReply} disabled={!replyText.trim() || sendingReply} startIcon={<Send size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
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
