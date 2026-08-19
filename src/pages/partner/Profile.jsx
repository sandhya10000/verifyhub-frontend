import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip, Divider, TextField, Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import useAuth from '../../context/useAuth';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Profile = () => {
  const { user } = useAuth();
  const profile = user?.profile || {};

  // Form states
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const [notifications, setNotifications] = useState({
    emailPDF: false,
    balanceAlert: false,
    whatsappFailures: false,
    pricingUpdates: false,
  });

  const handlePasswordUpdate = () => {
    if (passwords.new.length > 0 && passwords.new.length < 8) {
      alert('New password must be at least 8 characters.');
      return;
    }
    // TODO: Wire up actual password update API call here
    console.log('Update password clicked', passwords);
  };

  const handleSavePreferences = () => {
    // TODO: Wire up actual preferences save API call here
    console.log('Save preferences clicked', notifications);
  };

  const FieldRow = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value || '—'}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Your partner account, KYC and payout details. Contact support to change locked fields.
        </Typography>
      </Box>

      {/* Top Info Card */}
      <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'secondary.main',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.75rem',
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {user?.name || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Partner ID {user?.partnerId || user?.id || '—'} · Member since {profile?.memberSince || '—'}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={profile?.kycVerified ? "KYC Verified" : "KYC Pending"}
            sx={{
              bgcolor: profile?.kycVerified ? '#ECFDF5' : '#FFFBEB',
              color: profile?.kycVerified ? '#1b22a7' : '#D97706',
              fontWeight: 800,
              borderRadius: 6,
              py: 2.5,
              px: 1,
              fontSize: '0.8rem',
            }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Info Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FieldRow label="Contact Person" value={profile?.contactPerson} />
            <Divider sx={{ my: 2 }} />
            <FieldRow label="Mobile (Registered)" value={profile?.mobile} />
            <Divider sx={{ my: 2 }} />
            <FieldRow label="Business Type" value={profile?.businessType} />
            <Divider sx={{ my: 2 }} />
            <FieldRow label="GSTIN" value={profile?.gstin} />
            <Divider sx={{ my: 2 }} />
            <FieldRow label="Pricing Tier" value={user?.tierName ? `Tier ${user?.tier} - ${user?.tierName}` : '—'} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FieldRow label="Email" value={user?.email || profile?.email} />
            <Divider sx={{ my: 2 }} />
            <FieldRow label="PAN (Business)" value={profile?.pan} />
            <Divider sx={{ my: 2 }} />
            <FieldRow label="City/State" value={profile?.cityState} />
          </Grid>
        </Grid>
      </Paper>

      {/* Bottom Cards */}
      <Grid container spacing={4}>
        {/* Security Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Security
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Current password</Typography>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>New password</Typography>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  placeholder="Minimum 8 characters"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handlePasswordUpdate}
                sx={{
                  bgcolor: '#16A34A',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  mt: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#15803D', boxShadow: 'none' },
                }}
              >
                Update Password
              </Button>

              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                Two-factor login via OTP is always on for wallet actions.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Notifications Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Notifications
            </Typography>

            <FormGroup sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.emailPDF}
                    onChange={(e) => setNotifications({ ...notifications, emailPDF: e.target.checked })}
                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#16A34A' } }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Email me every report PDF automatically</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.balanceAlert}
                    onChange={(e) => setNotifications({ ...notifications, balanceAlert: e.target.checked })}
                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#16A34A' } }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Alert when wallet balance drops below ₹1,000</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.whatsappFailures}
                    onChange={(e) => setNotifications({ ...notifications, whatsappFailures: e.target.checked })}
                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#16A34A' } }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>WhatsApp alerts for failed fetches</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.pricingUpdates}
                    onChange={(e) => setNotifications({ ...notifications, pricingUpdates: e.target.checked })}
                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#16A34A' } }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Notify me when pricing or my tier changes</Typography>}
              />
            </FormGroup>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleSavePreferences}
              sx={{
                color: 'text.primary',
                borderColor: 'divider',
                fontWeight: 600,
                py: 1.5,
                '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
              }}
            >
              Save Preferences
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
