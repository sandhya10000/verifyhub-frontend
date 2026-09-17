import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, TextField, Button, IconButton, Menu, MenuItem, InputAdornment } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Search, X } from 'lucide-react';
import axios from 'axios';
import DataTable from '../../Components/shared/DataTable';
import StatusBadge from '../../Components/shared/StatusBadge';

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(null); // total from server

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const limit = 50;

  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

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

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_BASE_URL}/api/admin/partners?${queryParams}`, {
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

  const handleMenuClick = (event, partner) => {
    setAnchorEl(event.currentTarget);
    setSelectedPartner(partner);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPartner(null);
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

  const columns = [
    {
      header: 'Name',
      field: 'name',
      render: (row) => formatName(row.name)
    },
    { header: 'Email', field: 'email' },
    { header: 'Phone', field: 'phone' },
    {
      header: 'Total Reports',
      field: 'totalReports',
      render: (row) => (
        <Typography sx={{ fontWeight: 600 }}>
          {row.totalReports.toLocaleString()}
        </Typography>
      )
    },
    {
      header: 'Wallet Balance',
      field: 'walletBalance',
      render: (row) => {
        return(
          <Typography
            sx={{
              fontWeight: 700,
              color: row.walletBalance > 0 ? '#10B981' : 'text.primary'
            }}
          >-</Typography>
        );
      }
    },
    {
      header: 'Last Report',
      field: 'lastReportDate',
      render: (row) => row.lastReportDate ? new Date(row.lastReportDate).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }) : '—'
    },
    {
      header: 'Joined Date',
      field: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },
    // {
    //   header: 'Status',
    //   field: 'isActive',
    //   render: (row) => (
    //     <StatusBadge status={row.isActive ? 'Active' : 'Suspended'} />
    //   )
    // },
    // {
    //   header: '',
    //   field: 'action',
    //   render: (row) => (
    //     <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
    //       <MoreVertIcon fontSize="small" />
    //     </IconButton>
    //   )
    // }
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
      </Box>

      <Box sx={{ mb: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search name, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color={search ? '#3730A3' : '#94A3B8'} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearch('')}
                    edge="end"
                    sx={{ color: '#94A3B8', '&:hover': { color: '#1E293B' } }}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }
          }}
        />
      </Box>

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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          {selectedPartner?.isActive ? 'Suspend Account' : 'Reactivate Account'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminPartners;
