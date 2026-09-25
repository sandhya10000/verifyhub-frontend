import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Badge,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, MessageCircle, Filter, Send } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ticketService } from '../../services/ticketService';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Tickets</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by partner name or email..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#94A3B8" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ width: 300 }}
          />
          <FormControl size="small" sx={{ width: 200 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Partner</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Replies/Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length > 0 ? tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{formatName(ticket.partnerId?.name || 'Unknown')}</Typography>
                    <Typography variant="caption" color="textSecondary">{ticket.partnerId?.email || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>{ticket.reference || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status.toUpperCase()}
                      color={getStatusColor(ticket.status)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" title="Open conversation" onClick={() => handleOpenDialog(ticket)} sx={{ borderRadius: 2 }}>
                      <Badge badgeContent={(ticket.messages?.length || 0) + 1} color="primary" max={99} overlap="circular" anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18, fontWeight: 700 } }}>
                        <MessageCircle size={22} />
                      </Badge>
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
