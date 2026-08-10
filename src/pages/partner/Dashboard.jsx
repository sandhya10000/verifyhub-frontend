import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { currentPartner, recentPulls, activityFeed } from '../../services/mockData';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { CircleDot } from 'lucide-react';

const Dashboard = () => {
  const columns = [
    { header: 'Customer', field: 'customerName', render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.customerName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1 }}>{row.pan}</Typography>
        </Box>
      ) 
    },
    { header: 'Bureau', field: 'bureau' },
    { header: 'Score', field: 'score', render: (row) => <Typography sx={{ fontWeight: 700, color: row.score ? 'text.primary' : 'text.disabled' }}>{row.score || '-'}</Typography> },
    { header: 'Status', field: 'status', render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusBadge status={row.status} />
          {row.status === 'Failed' && <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>-₹{row.fee}</Typography>}
        </Box>
      ) 
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Good evening, {currentPartner.name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Credit report pulls, wallet and activity — updated in real time.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard 
            title="REPORTS DOWNLOADED · TODAY" 
            value="18" 
            trend="4" 
            subtitle="17 success / 1 failed" 
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard 
            title="REPORTS DOWNLOADED · THIS MONTH" 
            value="342" 
            subtitle="July 2026 · success rate 96.2%" 
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard 
            variant="dark"
            title="WALLET BALANCE AVAILABLE" 
            value={`₹${currentPartner.walletBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} 
            subtitle="Covers ~124 pulls at your tier · Last recharge 15 Jul"
            chipLabel=""
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <DataTable 
            title="Recent Report Pulls" 
            actionLabel="All reports" 
            columns={columns} 
            data={recentPulls} 
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Activity</Typography>
              <Typography component="a" href="#" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                View all &rarr;
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {activityFeed.map((activity, idx) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ py: 2, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                      <CircleDot size={12} color={
                        activity.type === 'pull' ? '#12B886' :
                        activity.type === 'fail' ? '#EF4444' :
                        activity.type === 'ai' ? '#3B82F6' : '#F59E0B'
                      } fill="currentColor" />
                    </ListItemIcon>
                    <ListItemText 
                      disableTypography
                      primary={
                        <Typography variant="body2" fontWeight={600} mb={0.5}>
                          {activity.message}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(activity.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(activity.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Typography>
                          {activity.amount !== 0 && (
                            <Typography variant="caption" sx={{ color: activity.amount > 0 ? 'success.main' : 'text.disabled', fontWeight: 600 }}>
                              {activity.amount > 0 ? '+' : ''}{activity.amount === 0 ? '-' : `₹${Math.abs(activity.amount).toLocaleString('en-IN')}`}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < activityFeed.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
