import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { CircleDot } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // These will be replaced with real API responses when the backend is ready.
  // Pass empty arrays / null so the UI renders its empty states immediately.
  const recentPulls  = [];   // TODO: fetch from /api/partner/pulls?limit=5
  const activityFeed = [];   // TODO: fetch from /api/partner/activity?limit=10
  const statsToday   = null; // TODO: fetch from /api/partner/stats/today
  const statsMonth   = null; // TODO: fetch from /api/partner/stats/month

  const walletBalance =
    user?.walletBalance != null
      ? `₹${Number(user.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : '₹0.00';

  const columns = [
    {
      header: 'Customer',
      field: 'customerName',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.customerName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1 }}>{row.pan}</Typography>
        </Box>
      ),
    },
    { header: 'Bureau', field: 'bureau' },
    {
      header: 'Score',
      field: 'score',
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: row.score ? 'text.primary' : 'text.disabled' }}>
          {row.score || '—'}
        </Typography>
      ),
    },
    {
      header: 'Status',
      field: 'status',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusBadge status={row.status} />
          {row.status === 'Failed' && (
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
              -₹{row.fee}
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ── Greeting ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {getGreeting()}, {user?.name || 'Partner'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Credit report pulls, wallet and activity — updated in real time.
        </Typography>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Reports Today */}
        <Grid size={{ xs: 12, md: 4 }}>
          {statsToday ? (
            <StatCard
              title="REPORTS DOWNLOADED · TODAY"
              value={String(statsToday.total)}
              trend={statsToday.trend > 0 ? String(statsToday.trend) : undefined}
              subtitle={`${statsToday.success} success / ${statsToday.failed} failed`}
            />
          ) : (
            <StatCard
              title="REPORTS DOWNLOADED · TODAY"
              value="—"
              subtitle="No reports pulled yet"
            />
          )}
        </Grid>

        {/* Reports This Month */}
        <Grid size={{ xs: 12, md: 4 }}>
          {statsMonth ? (
            <StatCard
              title="REPORTS DOWNLOADED · THIS MONTH"
              value={String(statsMonth.total)}
              subtitle={`${statsMonth.label} · success rate ${statsMonth.successRate}%`}
            />
          ) : (
            <StatCard
              title="REPORTS DOWNLOADED · THIS MONTH"
              value="—"
              subtitle="No reports this month yet"
            />
          )}
        </Grid>

        {/* Wallet Balance */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            variant="dark"
            title="WALLET BALANCE AVAILABLE"
            value={walletBalance}
            subtitle="No recharge history yet"
            chipLabel=""
          />
        </Grid>
      </Grid>

      {/* ── Main Content: Table + Activity ── */}
      <Grid container spacing={3}>
        {/* Recent Report Pulls */}
        <Grid size={{ xs: 12, md: 8 }}>
          <DataTable
            title="Recent Report Pulls"
            actionLabel="All reports"
            onAction={() => navigate('/partner/account/reports')}
            columns={columns}
            data={recentPulls}
            emptyMessage="No reports are available yet"
          />
        </Grid>

        {/* Activity Feed */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              height: '100%',
            }}
          >
            {/* Activity header */}
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Activity</Typography>
              <Typography
                component="span"
                onClick={() => navigate('/partner/account/activity')}
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View all &rarr;
              </Typography>
            </Box>

            {/* Activity list — or empty state */}
            {activityFeed.length === 0 ? (
              <Box
                sx={{
                  py: 6,
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
                {activityFeed.map((activity, idx) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ py: 2, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <CircleDot
                          size={12}
                          color={
                            activity.type === 'pull'    ? '#12B886' :
                            activity.type === 'fail'    ? '#EF4444' :
                            activity.type === 'ai'      ? '#3B82F6' : '#F59E0B'
                          }
                          fill="currentColor"
                        />
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
                              {new Date(activity.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                                ? 'Today'
                                : new Date(activity.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {' · '}
                              {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            {activity.amount !== 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: activity.amount > 0 ? 'success.main' : 'text.disabled',
                                  fontWeight: 600,
                                }}
                              >
                                {activity.amount > 0 ? '+' : ''}
                                {activity.amount === 0 ? '—' : `₹${Math.abs(activity.amount).toLocaleString('en-IN')}`}
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
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
