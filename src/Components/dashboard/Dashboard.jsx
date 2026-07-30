import React from 'react';
import { Box, Paper, Stack, Typography, Button, Card, CardContent } from '@mui/material';

const navItems = [
  "Add Fund",
  "RCU",
  "Banking Services",
  "CIBIL Services",
  "Loans & Credit",
  "Commission Plans",
  "Contact For API"
];

const bankStatementItems = [
  "Bank Statement Analysis",
  "Fetch Bank Statement (Mobile)"
];

const rcuItems = [
  "PAN Verification",
  "Aadhaar Verification",
  "GST Verification",
  "MSME Verification",
  "Bank Verification",
  "RC Verification",
  "Electricity Verification"
];

const loansCreditItems = [
  "Personal Loan (Instant)",
  "Personal Loan (Normal)",
  "Business Loan (Instant)",
  "Business Loan (Normal)",
  "Credit Card Apply",
  "Insurance (PolicyBazaar)",
  "Open Saving Account",
  "Loan Status",
  "Education Loan",
  "Education Leads"
];

const GridBox = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
      gap: 2
    }}
  >
    {children}
  </Box>
);

const DashboardCard = ({ title }) => (
  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 1 }}>
    <Typography variant="body2">{title}</Typography>
  </Card>
);

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      {/* Sidebar */}
      <Paper elevation={2} sx={{ width: 256, p: 2, borderRadius: 0, borderRight: 1, borderColor: 'divider', zIndex: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Management
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ bgcolor: '#2563eb', color: 'white', p: 1, borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="600">Dashboard</Typography>
          </Box>
          {navItems.map((item) => (
            <Typography key={item} variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer' }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 0, zIndex: 0 }}>
          <Typography variant="subtitle1" fontWeight="600">Welcome back</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ bgcolor: '#e5e7eb', px: 1.5, py: 0.5, borderRadius: 1 }}>
              <Typography variant="body2">Main ₹0</Typography>
            </Box>
            <Box sx={{ bgcolor: '#e5e7eb', px: 1.5, py: 0.5, borderRadius: 1 }}>
              <Typography variant="body2">CIBIL ₹0</Typography>
            </Box>
            <Button variant="contained" sx={{ bgcolor: '#22c55e', color: 'white', px: 2, py: 0.5, minWidth: 0, '&:hover': { bgcolor: '#16a34a' } }}>
              + Add Fund
            </Button>
          </Stack>
        </Paper>

        {/* Banner */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ background: 'linear-gradient(to right, #ef4444, #ec4899)', color: 'white', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="600">
              Booking • Recharge • Hotel • Visa • Coming Soon
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Stack spacing={5} sx={{ p: 3 }}>
          {/* Partner Hub */}
          <Box>
            <Typography variant="h5" fontWeight="bold">Partner Hub</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Welcome back, Online Sales
            </Typography>
            <Box sx={{ bgcolor: '#dbeafe', p: 1.5, borderRadius: 1 }}>
              <Typography variant="body2">UPDATE:</Typography>
            </Box>
          </Box>

          {/* Bank Statement */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              Bank Statement Analysis
            </Typography>
            <GridBox>
              {bankStatementItems.map(item => <DashboardCard key={item} title={item} />)}
            </GridBox>
          </Box>

          {/* RCU */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              RCU
            </Typography>
            <GridBox>
              {rcuItems.map(item => <DashboardCard key={item} title={item} />)}
            </GridBox>
          </Box>

          {/* Loans & Credit */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              Loans & Credit
            </Typography>
            <GridBox>
              {loansCreditItems.map(item => <DashboardCard key={item} title={item} />)}
            </GridBox>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
