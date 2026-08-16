import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { CircleDot } from 'lucide-react';

const Activity = () => {
  const [activityFeed, setActivityFeed] = useState([]); // Fetch from API later

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
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        {activityFeed.length === 0 ? (
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
            {activityFeed.map((activity, idx) => (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ py: 3, px: 3, alignItems: 'flex-start' }}>
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
    </Box>
  );
};

export default Activity;
