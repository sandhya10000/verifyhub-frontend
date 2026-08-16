import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  QrCode2,
  Info,
  CreditCard,
  CheckCircle,
} from '@mui/icons-material';
import useAuth from '../../context/useAuth';

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000];
const MIN_AMOUNT = 500;
const UPI_ID = 'payments@verifyhub';

const AddFunds = () => {
  const { user } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState(5000);
  const [customAmount, setCustomAmount] = useState('5000');
  const [activeMethod, setActiveMethod] = useState('upi');
  const [amountError, setAmountError] = useState('');
  const [qrReady, setQrReady] = useState(false);

  const parsedAmount = parseFloat(customAmount) || 0;

  const handlePresetClick = (amount) => {
    setSelectedPreset(amount);
    setCustomAmount(String(amount));
    setAmountError('');
    setQrReady(false);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setCustomAmount(val);
      setSelectedPreset(null);
      setAmountError('');
      setQrReady(false);
    }
  };

  const handleProceed = () => {
    const amt = parseFloat(customAmount) || 0;
    if (amt < MIN_AMOUNT) {
      setAmountError(`Minimum recharge amount is ₹${MIN_AMOUNT.toLocaleString('en-IN')}`);
      return;
    }
    setAmountError('');
    if (activeMethod === 'upi') {
      setQrReady(true);
    } else {
      alert(`Redirecting to payment gateway for ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    }
  };

  const formatINR = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          Add Funds
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
          Recharge your wallet instantly. Funds reflect within seconds of a successful payment.
        </Typography>
      </Box>

      {/* Two-column layout */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Left Column: Recharge Amount */}
        <Grid size={{ xs: 12, md: 8, lg: 7 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(15,27,45,.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2.5, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}
              >
                Recharge Amount
              </Typography>

              {/* Preset Amount Buttons */}
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {PRESET_AMOUNTS.map((amount) => {
                  const isSelected = selectedPreset === amount;
                  return (
                    <Grid size={{ xs: 6, sm: 3 }} key={amount}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handlePresetClick(amount)}
                        sx={{
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '1rem',
                          py: 1.5,
                          px: 1,
                          borderColor: isSelected ? '#16A34A' : '#E2E8F0',
                          color: isSelected ? '#16A34A' : 'text.secondary',
                          bgcolor: isSelected ? '#F0FDF4' : '#fff',
                          fontFamily: '"Inter", sans-serif',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            borderColor: '#16A34A',
                            color: '#16A34A',
                            bgcolor: '#F0FDF4',
                          },
                        }}
                      >
                        ₹{amount.toLocaleString('en-IN')}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Custom Amount Input */}
              <TextField
                fullWidth
                label="Custom amount (₹)"
                value={customAmount}
                onChange={handleCustomChange}
                error={!!amountError}
                helperText={
                  amountError || 'Minimum recharge ₹500 · No convenience fee on UPI'
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '1.1rem' }}>
                          ₹
                        </Typography>
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      fontFamily: '"Inter", sans-serif',
                    },
                  },
                  formHelperText: {
                    sx: { color: amountError ? 'error.main' : 'text.secondary', mt: 0.75 },
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              {/* Payment Method Tiles */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  {
                    id: 'upi',
                    icon: <QrCode2 sx={{ fontSize: 22 }} />,
                    title: 'UPI / QR Code',
                    sub: 'Scan & pay — instant credit',
                  },
                  {
                    id: 'gateway',
                    icon: <CreditCard sx={{ fontSize: 22 }} />,
                    title: 'Payment Gateway',
                    sub: 'Cards · Net banking · Wallets',
                  },
                ].map((method) => {
                  const isActive = activeMethod === method.id;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={method.id}>
                      <Paper
                        onClick={() => setActiveMethod(method.id)}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: isActive ? '#16A34A' : '#E2E8F0',
                          bgcolor: isActive ? '#F0FDF4' : '#FAFAFA',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.18s ease',
                          '&:hover': { borderColor: '#16A34A', bgcolor: '#F0FDF4' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '8px',
                            bgcolor: isActive ? '#DCFCE7' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: isActive ? '#16A34A' : '#64748B',
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                            {method.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {method.sub}
                          </Typography>
                        </Box>
                        {isActive && <CheckCircle sx={{ color: '#16A34A', fontSize: 18 }} />}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* CTA Button */}
              <Button
                fullWidth
                size="large"
                onClick={handleProceed}
                sx={{
                  background:
                    parsedAmount >= MIN_AMOUNT
                      ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                      : '#E2E8F0',
                  color: parsedAmount >= MIN_AMOUNT ? '#fff' : '#94A3B8',
                  py: 1.75,
                  borderRadius: '10px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  boxShadow:
                    parsedAmount >= MIN_AMOUNT
                      ? '0 4px 16px rgba(22,163,74,.35)'
                      : 'none',
                  transition: 'all 0.2s ease',
                  cursor: parsedAmount >= MIN_AMOUNT ? 'pointer' : 'not-allowed',
                  '&:hover': {
                    background:
                      parsedAmount >= MIN_AMOUNT
                        ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
                        : '#E2E8F0',
                    transform: parsedAmount >= MIN_AMOUNT ? 'translateY(-1px)' : 'none',
                    boxShadow:
                      parsedAmount >= MIN_AMOUNT
                        ? '0 6px 20px rgba(22,163,74,.45)'
                        : 'none',
                  },
                }}
              >
                {parsedAmount >= MIN_AMOUNT
                  ? `Proceed to Pay ₹${formatINR(customAmount)}`
                  : parsedAmount > 0
                  ? `Minimum ₹${MIN_AMOUNT.toLocaleString('en-IN')} required`
                  : 'Enter an amount to proceed'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Pay via UPI QR */}
        <Grid size={{ xs: 12, md: 4, lg: 5 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(15,27,45,.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2.5, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}
              >
                Pay via UPI QR
              </Typography>

              {/* QR Code Box */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxWidth: 240,
                  mx: 'auto',
                  mb: 2.5,
                  borderRadius: '12px',
                  border: '2px dashed',
                  borderColor: qrReady ? '#16A34A' : '#CBD5E1',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#F8FAFC',
                  transition: 'border-color 0.3s ease',
                }}
              >
                {qrReady ? (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block' }}
                    >
                      <rect width="200" height="200" fill="#fff" />
                      {/* Top-left position marker */}
                      <rect x="10" y="10" width="50" height="50" rx="4" fill="#0A1628" />
                      <rect x="18" y="18" width="34" height="34" rx="2" fill="#fff" />
                      <rect x="24" y="24" width="22" height="22" rx="2" fill="#0A1628" />
                      {/* Top-right position marker */}
                      <rect x="140" y="10" width="50" height="50" rx="4" fill="#0A1628" />
                      <rect x="148" y="18" width="34" height="34" rx="2" fill="#fff" />
                      <rect x="154" y="24" width="22" height="22" rx="2" fill="#0A1628" />
                      {/* Bottom-left position marker */}
                      <rect x="10" y="140" width="50" height="50" rx="4" fill="#0A1628" />
                      <rect x="18" y="148" width="34" height="34" rx="2" fill="#fff" />
                      <rect x="24" y="154" width="22" height="22" rx="2" fill="#0A1628" />
                      {/* Data modules */}
                      {[
                        [70,70],[80,70],[90,70],[110,70],[130,70],
                        [70,80],[100,80],[120,80],[130,80],
                        [80,90],[90,90],[110,90],[120,90],
                        [70,100],[90,100],[100,100],[110,100],[130,100],
                        [80,110],[90,110],[120,110],[130,110],
                        [70,120],[100,120],[110,120],
                        [80,130],[90,130],[110,130],[120,130],[130,130],
                      ].map(([x, y], i) => (
                        <rect key={i} x={x} y={y} width="8" height="8" fill="#0A1628" rx="1" />
                      ))}
                      {/* Green center logo circle */}
                      <circle cx="100" cy="100" r="14" fill="#fff" />
                      <circle cx="100" cy="100" r="10" fill="#16A34A" />
                      <text x="100" y="104" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">V</text>
                    </svg>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.8rem' }}>
                        ₹{formatINR(customAmount)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(9, 1fr)',
                        gap: '3px',
                        mb: 1.5,
                        opacity: 0.2,
                        mx: 'auto',
                        width: 'fit-content',
                      }}
                    >
                      {[...Array(81)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 10,
                            height: 10,
                            bgcolor: (i + Math.floor(i / 9)) % 2 === 0 ? '#0A1628' : 'transparent',
                            borderRadius: '1px',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.72rem', lineHeight: 1.5, display: 'block' }}
                    >
                      UPI QR renders here after
                      <br />
                      amount is confirmed
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* UPI ID row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#F8FAFC',
                  borderRadius: '8px',
                  px: 2,
                  py: 1.25,
                  mb: 2,
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    UPI ID
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", "Roboto Mono", monospace' }}
                  >
                    {UPI_ID}
                  </Typography>
                </Box>
                <Chip
                  label="Copy"
                  size="small"
                  onClick={() => navigator.clipboard?.writeText(UPI_ID)}
                  sx={{
                    bgcolor: '#ECFDF5',
                    color: '#16A34A',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#DCFCE7' },
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Partner ID callout */}
              <Alert
                icon={<Info sx={{ fontSize: 18 }} />}
                severity="warning"
                sx={{
                  bgcolor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  '& .MuiAlert-icon': { color: '#D97706', alignItems: 'flex-start', pt: 0.5 },
                  '& .MuiAlert-message': { lineHeight: 1.5 },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400E' }}>
                  Add your Partner ID{' '}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 800,
                      fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
                      bgcolor: '#FEF3C7',
                      px: 0.75,
                      py: 0.15,
                      borderRadius: '4px',
                    }}
                  >
                    {user?.partnerId || user?.id || user?._id || 'Pending'}
                  </Box>{' '}
                  in the payment note so credit is matched automatically.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddFunds;
