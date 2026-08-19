import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

const Support = () => {
  const [formData, setFormData] = useState({
    category: '',
    reference: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const categories = [
    "Wallet — recharge not credited",
    "Report generation issue",
    "API/integration issue",
    "Billing query",
    "Other"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    // TODO: Connect this to actual backend endpoint e.g., /api/support/ticket
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToast({
        open: true,
        message: 'Ticket submitted successfully! We will get back to you shortly.',
        severity: 'success'
      });
      setFormData({ category: '', reference: '', description: '' });
    } catch (error) {
      setToast({
        open: true,
        message: 'Failed to submit ticket. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Support
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Raise a ticket for wallet, report or API issues — most tickets close within 4 working hours.
        </Typography>
      </Box>

      {/* ── Two Column Layout (plain CSS Grid — avoids MUI Grid v1/v2 sizing issues) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {/* ── Left Column: Reach Us ── */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(15,27,45,.05)',
            minWidth: 0, // prevents grid item from overflowing based on content
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Reach Us
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                WHATSAPP
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                +91 99107 37470
              </Typography>
            </Box>
            <Divider />

            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                EMAIL
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                info@verifyhub.in
              </Typography>
            </Box>
            <Divider />

            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                HOURS
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Mon–Sat · 9:30 AM – 7:00 PM IST
              </Typography>
            </Box>
            <Divider />

            <Box sx={{ py: 2, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
                ESCALATION
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                partners@verifyhub.in
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ── Right Column: Raise a Ticket ── */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(15,27,45,.05)',
            minWidth: 0, // prevents grid item from overflowing based on content
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Raise a Ticket
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              error={!!errors.category}
              helperText={errors.category}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            >
              {categories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Reference (Txn ID / PAN, optional)"
              name="reference"
              placeholder="TXN-88395"
              value={formData.reference}
              onChange={handleInputChange}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe the issue"
              name="description"
              placeholder="Tell us what happened..."
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            <Box sx={{ mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ── Toast Notification ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Support;