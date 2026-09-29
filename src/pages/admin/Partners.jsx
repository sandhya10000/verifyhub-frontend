import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import RowActions from '../../components/shared/RowActions';
import FilterBar from '../../components/shared/FilterBar';

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(null); // total from server

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const limit = 50;

  const [selectedPartner, setSelectedPartner] = useState(null);

  // Suspend/reactivate confirm + progress
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  // Add Funds modal
  const [fundsOpen, setFundsOpen] = useState(false);
  const [fundsOptions, setFundsOptions] = useState([]);
  const [fundsLoading, setFundsLoading] = useState(false);
  const [fundsPartner, setFundsPartner] = useState(null);
  const [fundsAmount, setFundsAmount] = useState('');
  const [fundsNote, setFundsNote] = useState('');
  const [fundsSubmitting, setFundsSubmitting] = useState(false);
  const [fundsError, setFundsError] = useState(null);
  const [fundsSuccess, setFundsSuccess] = useState(null);

  const inr0 = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  };
  const fundsAmountNum = Math.round(Number(fundsAmount) * 100) / 100;
  const fundsPreview = fundsPartner && Number.isFinite(fundsAmountNum) && fundsAmountNum > 0
    ? Number(fundsPartner.walletBalance || 0) + fundsAmountNum
    : null;

  // 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch })
      }).toString();

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_BASE_URL}/admin/partners?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setPartners(res.data.data);
        setTotalCount(res.data.total ?? res.data.data.length);
      } else {
        setError('Failed to load partners data.');
      }
    } catch (err) {
      console.error('Failed to fetch admin partners:', err);
      setError('Failed to load partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [page, debouncedSearch]);

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setSelectedPartner(null);
  };

  const handleConfirmToggle = async () => {
    if (!selectedPartner) return;
    const nextActive = !(selectedPartner.isActive !== false);
    setToggling(true);
    setToggleError(null);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.patch(
        `${API_BASE_URL}/admin/partners/${selectedPartner._id}/status`,
        { isActive: nextActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setPartners((prev) => prev.map((p) => (p._id === selectedPartner._id ? { ...p, isActive: nextActive } : p)));
        setConfirmOpen(false);
        setSelectedPartner(null);
      } else {
        setToggleError(res.data?.message || 'Failed to update status.');
      }
    } catch (err) {
      setToggleError(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  const handleOpenFunds = async (preset = null) => {
    setFundsError(null);
    setFundsSuccess(null);
    setFundsAmount('');
    setFundsNote('');
    setFundsPartner(preset || null);
    setFundsOpen(true);
    // Load a wide option list for the dropdown (first page, big limit)
    setFundsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_BASE_URL}/admin/partners?page=1&limit=500`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setFundsOptions(res.data.data);
        if (preset) {
          const fresh = res.data.data.find((p) => p._id === preset._id);
          if (fresh) setFundsPartner(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to load partners for top-up:', err);
    } finally {
      setFundsLoading(false);
    }
  };

  const handleCloseFunds = () => {
    if (fundsSubmitting) return;
    setFundsOpen(false);
    setFundsPartner(null);
    setSelectedPartner(null);
  };

  const handleSubmitFunds = async () => {
    if (!fundsPartner || !(fundsAmountNum > 0)) {
      setFundsError('Select a partner and enter a positive amount.');
      return;
    }
    setFundsSubmitting(true);
    setFundsError(null);
    setFundsSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(
        `${API_BASE_URL}/admin/partners/${fundsPartner._id}/add-funds`,
        { amount: fundsAmountNum, note: fundsNote.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        const { walletBalance, credited } = res.data.data;
        setFundsPartner((prev) => (prev ? { ...prev, walletBalance } : prev));
        setFundsOptions((prev) => prev.map((p) => (p._id === fundsPartner._id ? { ...p, walletBalance } : p)));
        setPartners((prev) => prev.map((p) => (p._id === fundsPartner._id ? { ...p, walletBalance } : p)));
        setFundsSuccess(`${inr0(credited)} added. New balance ${inr0(walletBalance)}. Receipt mailed to the partner.`);
        setFundsAmount('');
        setFundsNote('');
      } else {
        setFundsError(res.data?.message || 'Failed to add funds.');
      }
    } catch (err) {
      setFundsError(err.response?.data?.message || 'Failed to add funds. Please try again.');
    } finally {
      setFundsSubmitting(false);
    }
  };

  const formatName = (name = "") => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Result count label shown below search
  const resultLabel = (() => {
    if (loading) return null;
    if (error) return null;
    if (debouncedSearch) {
      if (partners.length === 0) return `No partners match "${debouncedSearch}"`;
      return `${partners.length}${partners.length === limit ? '+' : ''} of ${totalCount ?? partners.length} partner${(totalCount ?? partners.length) !== 1 ? 's' : ''} match "${debouncedSearch}"`;
    }
    if (totalCount != null) return `${totalCount} partner${totalCount !== 1 ? 's' : ''} total`;
    return null;
  })();

  const openDetails = (p) => window.open(`/admin/partners/${p._id}`, '_blank', 'noopener,noreferrer');

  const columns = [
    {
      header: 'Partner ID', field: 'partner_id', nowrap: true, minWidth: 100,
      render: (row) => (
        <Typography
          component={RouterLink}
          to={`/admin/partners/${row._id}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open partner profile in new tab"
          sx={{
            fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
            color: '#1D4ED8', textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {row.partner_id || '—'}
        </Typography>
      ),
    },
    {
      header: 'Name', field: 'name', minWidth: 130,
      render: (row) => (
        <Typography title={formatName(row.name)} sx={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatName(row.name)}
        </Typography>
      )
    },
    {
      header: 'Email', field: 'email', minWidth: 170,
      render: (row) => (
        <Typography title={row.email} sx={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.email}
        </Typography>
      )
    },
    { header: 'Phone', field: 'phone', nowrap: true, minWidth: 110 },
    {
      header: 'Total Reports', field: 'totalReports', nowrap: true, minWidth: 90, align: 'right',
      render: (row) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
          {Number(row.totalReports || 0).toLocaleString()}
        </Typography>
      )
    },
    {
      header: 'Wallet Balance', field: 'walletBalance', nowrap: true, minWidth: 110, align: 'right',
      render: (row) => {
        const bal = Number(row.walletBalance);
        const label = Number.isFinite(bal)
          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bal)
          : '—';
        return (
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', color: bal > 0 ? '#10B981' : 'text.primary' }}>
            {label}
          </Typography>
        );
      }
    },
    {
      header: 'Last Report', field: 'lastReportDate', nowrap: true, minWidth: 110,
      render: (row) => (
        <Typography sx={{ fontSize: '0.78rem', color: '#33415C', whiteSpace: 'nowrap' }}>
          {row.lastReportDate ? new Date(row.lastReportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </Typography>
      )
    },
    {
      header: 'Joined Date', field: 'createdAt', nowrap: true, minWidth: 110,
      render: (row) => (
        <Typography sx={{ fontSize: '0.78rem', color: '#33415C', whiteSpace: 'nowrap' }}>
          {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Typography>
      )
    },
    {
      header: 'Status', field: 'isActive', nowrap: true, minWidth: 110,
      render: (row) => (
        <StatusBadge status={row.isActive !== false ? 'Active' : 'Suspended'} />
      )
    },
    {
      header: 'Actions', field: 'action', align: 'right', width: 60,
      render: (row) => (
        <RowActions actions={[
          { label: 'View Details', onClick: () => openDetails(row) },
          { label: 'Add Funds', onClick: () => handleOpenFunds(row) },
          { label: row.isActive !== false ? 'Suspend Account' : 'Reactivate Account', danger: row.isActive !== false, onClick: () => { setSelectedPartner(row); setToggleError(null); setConfirmOpen(true); } },
        ]} />
      )
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Partners
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage and view all registered partners.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenFunds()} sx={{ whiteSpace: 'nowrap' }}>
          Add Funds
        </Button>
      </Box>

      <FilterBar
        search={{
          value: search,
          onChange: (v) => setSearch(v),
          placeholder: 'Search name, email, or phone…',
        }}
      />

      {/* Result count label */}
      <Box sx={{ mb: 3, minHeight: 20 }}>
        {resultLabel && (
          <Typography
            variant="caption"
            sx={{
              color: partners.length === 0 && debouncedSearch ? 'error.main' : 'text.disabled',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            {resultLabel}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3730A3' }} />
        </Box>
      ) : (
        <>
          <DataTable
            title="Registered Partners"
            columns={columns}
            data={partners}
            emptyMessage="No partners found."
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous Page</Button>
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>Page {page}</Typography>
            <Button disabled={partners.length < limit} onClick={() => setPage(p => p + 1)}>Next Page</Button>
          </Box>
        </>
      )}

      <Dialog open={confirmOpen} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {selectedPartner?.isActive !== false ? 'Suspend partner?' : 'Reactivate partner?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedPartner?.isActive !== false ? (
              <>Suspending <b>{selectedPartner?.name || selectedPartner?.email}</b> signs them out immediately — they cannot log in or pull reports until reactivated. Wallet balance and history are preserved.</>
            ) : (
              <>Reactivating <b>{selectedPartner?.name || selectedPartner?.email}</b> restores their access immediately.</>
            )}
          </DialogContentText>
          {toggleError && (
            <Alert severity="error" sx={{ mt: 2 }}>{toggleError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} disabled={toggling}>Cancel</Button>
          <Button
            onClick={handleConfirmToggle}
            disabled={toggling}
            color={selectedPartner?.isActive !== false ? 'error' : 'success'}
            variant="contained"
          >
            {toggling ? 'Please wait…' : selectedPartner?.isActive !== false ? 'Suspend' : 'Reactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={fundsOpen} onClose={handleCloseFunds} maxWidth="sm" fullWidth>
        <DialogTitle>Add Funds to Partner Wallet</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Top-up is credited in full — no GST. The partner gets a receipt by email.
          </DialogContentText>
          {fundsError && <Alert severity="error" sx={{ mb: 2 }}>{fundsError}</Alert>}
          {fundsSuccess && <Alert severity="success" sx={{ mb: 2 }}>{fundsSuccess}</Alert>}
          <Autocomplete
            options={fundsOptions}
            loading={fundsLoading}
            value={fundsPartner}
            onChange={(_, v) => setFundsPartner(v)}
            getOptionLabel={(p) => `${p.name || ''} · ${p.email || ''} · ${p.partner_id || ''}`}
            isOptionEqualToValue={(a, b) => a._id === b._id}
            renderInput={(params) => <TextField {...params} label="Select partner" size="small" fullWidth />}
            sx={{ mb: 2, mt: 1 }}
          />
          {fundsPartner && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current balance</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{inr0(fundsPartner.walletBalance)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Balance after top-up</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: fundsPreview != null ? '#10B981' : 'text.primary' }}>
                  {fundsPreview != null ? inr0(fundsPreview) : '—'}
                </Typography>
              </Box>
            </Box>
          )}
          <TextField
            label="Top-up amount (₹)"
            type="number"
            size="small"
            fullWidth
            value={fundsAmount}
            onChange={(e) => setFundsAmount(e.target.value)}
            inputProps={{ min: 1, step: 'any' }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Note (optional)"
            size="small"
            fullWidth
            value={fundsNote}
            onChange={(e) => setFundsNote(e.target.value)}
            placeholder="e.g. Goodwill credit for downtime"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFunds} disabled={fundsSubmitting}>Close</Button>
          <Button onClick={handleSubmitFunds} disabled={fundsSubmitting || !fundsPartner || !(fundsAmountNum > 0)} variant="contained">
            {fundsSubmitting ? 'Adding…' : 'Add Funds'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPartners;
