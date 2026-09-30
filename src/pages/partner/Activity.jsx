import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, Divider, CircularProgress, Chip } from '@mui/material';
import { CircleDot, FileCheck2, FileX2, Wallet, Receipt, Headphones } from 'lucide-react';
import axios from 'axios';
import { timeAgo } from '../../Components/admin/AdminWidgets';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fmtDateTime = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
};

const TYPE_META = {
  pull: { bg: '#E7F8F0', fg: '#0E9F6E', Icon: FileCheck2, label: 'Report' },
  fail: { bg: '#FDECEC', fg: '#E02424', Icon: FileX2, label: 'Failed' },
  recharge: { bg: '#EAF1FE', fg: '#1D4ED8', Icon: Wallet, label: 'Recharge' },
  spend: { bg: '#FFF6E5', fg: '#C07A00', Icon: Receipt, label: 'Charge' },
  ticket: { bg: '#F1EAFE', fg: '#7C3AED', Icon: Headphones, label: 'Support' },
};

const Activity = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/partner/overview/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          const { pulls = [], recentTxns = [], recentTickets = [] } = res.data.data;
          const items = [
            ...pulls.map((p) => ({
              id: `p-${p.id}`,
              type: p.status === 'Success' ? 'pull' : 'fail',
              message: p.status === 'Success' ? `Report pulled · ${p.customer}` : `Report failed · ${p.customer}`,
              sub: p.bureau || '',
              detail: p.score != null && p.score !== '—' ? `Score ${p.score}` : '',
              timestamp: p.createdAt,
              amount: 0,
            })),
            ...recentTxns.map((t) => ({
              id: `t-${t._id}`,
              type: t.type === 'CREDIT' ? 'recharge' : 'spend',
              message: t.type === 'CREDIT' ? 'Wallet recharged' : `Report charge · ${(t.purpose || '').replace(/_/g, ' ')}`,
              sub: '',
              timestamp: t.createdAt,
              amount: t.type === 'CREDIT' ? t.amount : -Math.abs(t.totalAmount ?? t.amount ?? 0),
            })),
            ...recentTickets.map((t) => ({
              id: `k-${t._id}`,
              type: 'ticket',
              message: `Ticket ${t.status} · ${t.category}`,
              sub: '',
              timestamp: t.createdAt,
              amount: 0,
            })),
          ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setFeed(items);
        }
      } catch (err) {
        console.error('Failed to load activity:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Activity
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Everything that happened on your account, newest first.
        </Typography>
      </Box>

      <Paper
        sx={{
          borderRadius: 0.5,
          border: '1px solid #E8EEF5',
          boxShadow: 'none',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#3730A3' }} />
          </Box>
        ) : feed.length === 0 ? (
          <Box
            sx={{
              py: 8,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircleDot size={28} color="#CBD5E1" />
            <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center' }}>
              No activity found
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {feed.map((activity, idx) => {
              const meta = TYPE_META[activity.type] || TYPE_META.spend;
              const Icon = meta.Icon;
              return (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ py: 1.75, px: 2.5, alignItems: 'center', gap: 1.75 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: meta.bg, color: meta.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activity.message}
                      </Typography>
                      <Chip label={meta.label} size="small" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, bgcolor: meta.bg, color: meta.fg, flexShrink: 0 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#8A94A6', display: 'block', mt: 0.25 }}>
                      {activity.sub ? `${activity.sub} · ` : ''}{timeAgo(activity.timestamp)} · {fmtDateTime(activity.timestamp)}
                      {activity.detail ? ` · ${activity.detail}` : ''}
                    </Typography>
                  </Box>
                  {activity.amount !== 0 ? (
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: activity.amount > 0 ? '#0E9F6E' : '#0F1E33', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {activity.amount > 0 ? '+' : '−'}₹{Math.abs(activity.amount).toLocaleString('en-IN')}
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#B0B8C5', flexShrink: 0 }}>—</Typography>
                  )}
                </ListItem>
                {idx < feed.length - 1 && <Divider component="li" sx={{ borderColor: '#F1F5F9' }} />}
              </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Activity;
