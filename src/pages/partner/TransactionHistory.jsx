import React, { useState } from 'react';
import { Box, Typography, Chip, ButtonGroup, Button } from '@mui/material';
import DataTable from '../../Components/shared/DataTable';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]); // Fetch from API later
  const [filter, setFilter] = useState('All');

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Debits') return t.type === 'Debit';
    if (filter === 'Credits') return t.type === 'Credit';
    return true;
  });

  const columns = [
    { header: 'TXN ID', field: 'txnId' },
    { header: 'Date & Time', field: 'datetime' },
    { header: 'Description', field: 'description' },
    {
      header: 'Type',
      field: 'type',
      render: (row) => (
        <Chip
          label={row.type}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.7rem',
            bgcolor: row.type === 'Credit' ? '#ECFDF5' : '#FEF2F2',
            color: row.type === 'Credit' ? '#1b22a7' : '#DC2626',
          }}
        />
      ),
    },
    {
      header: 'Amount',
      field: 'amount',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: row.type === 'Credit' ? 'success.main' : 'error.main'
          }}
        >
          {row.type === 'Credit' ? '+' : '-'}₹{Math.abs(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      header: 'Balance',
      field: 'balance',
      render: (row) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          ₹{row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      )
    }
  ];

  const currentMonthYear = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const customHeader = (
    <>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {currentMonthYear}
      </Typography>
      <ButtonGroup size="small" sx={{
        bgcolor: 'background.default',
        p: 0.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '& .MuiButton-root': {
          border: 'none',
          borderRadius: 1.5,
          color: 'text.secondary',
          fontWeight: 600,
          px: 2,
          '&:hover': {
            border: 'none',
            bgcolor: 'action.hover'
          }
        }
      }}>
        <Button
          onClick={() => setFilter('All')}
          sx={{
            bgcolor: filter === 'All' ? '#111827 !important' : 'transparent',
            color: filter === 'All' ? '#fff !important' : 'text.secondary'
          }}
        >
          All
        </Button>
        <Button
          onClick={() => setFilter('Debits')}
          sx={{
            bgcolor: filter === 'Debits' ? '#111827 !important' : 'transparent',
            color: filter === 'Debits' ? '#fff !important' : 'text.secondary'
          }}
        >
          Debits
        </Button>
        <Button
          onClick={() => setFilter('Credits')}
          sx={{
            bgcolor: filter === 'Credits' ? '#111827 !important' : 'transparent',
            color: filter === 'Credits' ? '#fff !important' : 'text.secondary'
          }}
        >
          Credits
        </Button>
      </ButtonGroup>
    </>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Transaction History
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Every wallet debit and credit, matched to a transaction ID.
        </Typography>
      </Box>

      <DataTable
        headerContent={customHeader}
        columns={columns}
        data={filteredTransactions}
        emptyMessage="No transactions yet"
      />
    </Box>
  );
};

export default TransactionHistory;
