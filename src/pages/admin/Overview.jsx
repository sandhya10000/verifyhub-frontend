import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { adminOverviewStats, chartData, adminPullsByBureau, platformActivity } from '../../services/mockData';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const AdminOverview = () => {
  const pullsColumns = [
    { header: 'Bureau', field: 'bureau', render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.bureau}</Typography> },
    { header: 'Pulls', field: 'pulls', render: (row) => <Typography variant="body2">{row.pulls}</Typography> },
    { header: 'Failed', field: 'failed', render: (row) => <Typography variant="body2">{row.failed}</Typography> },
    { header: 'Revenue', field: 'revenue', render: (row) => <Typography variant="body2">₹{row.revenue.toLocaleString()}</Typography> },
    { header: 'Cost', field: 'cost', render: (row) => <Typography variant="body2">₹{row.cost.toLocaleString()}</Typography> },
    { header: 'Profit', field: 'profit', render: (row) => <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>₹{row.profit.toLocaleString()}</Typography> },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Platform Overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · live figures across all partners.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="REPORTS PULLED TODAY" 
            value={adminOverviewStats.reportsPulled.value} 
            trend={`${adminOverviewStats.reportsPulled.trend}%`} 
            subtitle={`${adminOverviewStats.reportsPulled.success} success / ${adminOverviewStats.reportsPulled.failed} failed`} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="REVENUE TODAY" 
            value={`₹${adminOverviewStats.revenueToday.toLocaleString('en-IN')}`} 
            subtitle="Selling price collected across all pulls" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="API COST TODAY" 
            value={`₹${adminOverviewStats.apiCostToday.toLocaleString('en-IN')}`} 
            subtitle="Payable to bureau / API providers" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            variant="dark"
            title="PROFIT TODAY" 
            value={`₹${adminOverviewStats.profitToday.toLocaleString('en-IN')}`} 
            subtitle={`Margin ${adminOverviewStats.marginPercent}% · July so far: ₹${adminOverviewStats.monthProfit.toLocaleString('en-IN')}`} 
            chipLabel=""
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="ACTIVE PARTNERS" 
            value={adminOverviewStats.activePartners.value} 
            trend={adminOverviewStats.activePartners.trend} 
            subtitle={`this week · ${adminOverviewStats.activePartners.frozen} frozen`} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="WALLET LIABILITY" 
            value={`₹${adminOverviewStats.walletLiability.toLocaleString('en-IN')}`} 
            subtitle="Total unspent balance across partner wallets" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="RECHARGES TODAY" 
            value={`₹${adminOverviewStats.rechargesToday.value.toLocaleString('en-IN')}`} 
            subtitle={`${adminOverviewStats.rechargesToday.count} payments · ${adminOverviewStats.rechargesToday.pending} QR pending approval`} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="AI ANALYSES TODAY" 
            value={adminOverviewStats.aiAnalysesToday.value} 
            subtitle={`Claude API · avg ${adminOverviewStats.aiAnalysesToday.avgTime} per analysis`} 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Revenue vs Profit — Last 7 Days</Typography>
            <Box sx={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                  <Bar dataKey="Revenue" fill="#A7F3D0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <DataTable 
            title="Pulls by Bureau — Today" 
            columns={pullsColumns} 
            data={adminPullsByBureau} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverview;
