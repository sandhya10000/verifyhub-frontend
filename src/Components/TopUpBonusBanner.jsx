import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

export const BONUS_AMOUNTS = [500, 1000, 2500, 5000, 10000];
export const BONUS_POINTS_RATIO = 1;

const inrFormat = new Intl.NumberFormat('en-IN');
const formatNumber = (num) => inrFormat.format(num);

const TopUpBonusBanner = ({ sx = {} }) => {
  const [selectedAmount, setSelectedAmount] = useState(1000);

  const bonusPoints = Math.round(selectedAmount * BONUS_POINTS_RATIO);
  const formattedAmount = formatNumber(selectedAmount);
  const formattedBonus = formatNumber(bonusPoints);

  return (
    <Box
      component="section"
      aria-label="Wallet top-up bonus offer"
      sx={{
        width: '100%',
        maxWidth: 600,
        boxSizing: 'border-box',
        border: '1.5px solid #7ea7fe',
        borderRadius: '20px',
        p: { xs: '18px', sm: '24px' },
        bgcolor: 'rgba(246, 181, 42, 0.09)',
        color: '#FFFFFF',
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        ...sx,
      }}
    >
      {/* Heading */}
      <Typography
        component="h3"
        sx={{
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          m: 0,
          mb: 1.25,
          fontFamily: 'inherit',
        }}
      >
        Top up your wallet and get the same amount in{' '}
        <Box component="em" sx={{ fontStyle: 'normal', color: '#7ea7fe' }}>
          bonus points
        </Box>
      </Typography>

      {/* Dynamic Subtext */}
      <Typography
        component="p"
        sx={{
          color: '#B9C2F3',
          fontSize: { xs: '0.9rem', sm: '0.97rem' },
          lineHeight: 1.5,
          m: 0,
          mb: 2.5,
          fontFamily: '"Inter", sans-serif',
        }}
      >
        Add ₹{formattedAmount} to your wallet and ₹{formattedAmount} in bonus points is credited to your account.
      </Typography>

      {/* Chips Fieldset */}
      <Box
        component="fieldset"
        sx={{
          border: 'none',
          p: 0,
          m: 0,
          mb: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.25,
        }}
      >
        {/* Visually hidden legend for accessibility */}
        <Box
          component="legend"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            p: 0,
            m: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Choose a top-up amount
        </Box>

        {BONUS_AMOUNTS.map((amt) => {
          const isSelected = selectedAmount === amt;
          const inputId = `bonus-amount-${amt}`;
          return (
            <Box
              key={amt}
              component="label"
              htmlFor={inputId}
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 1.75, sm: 2.2 },
                py: { xs: 0.75, sm: 0.85 },
                borderRadius: '9999px',
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.92rem' },
                fontFamily: '"Inter", sans-serif',
                border: isSelected ? '1px solid #7ea7fe' : '1px solid rgba(255, 255, 255, 0.2)',
                bgcolor: isSelected ? '#7ea7fe' : 'transparent',
                color: isSelected ? '#1A1400' : '#FFFFFF',
                transition: 'all 0.18s ease-in-out',
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
                '&:hover': {
                  bgcolor: isSelected ? '#7ea7fe' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: isSelected ? '#7ea7fe' : 'rgba(255, 255, 255, 0.35)',
                },
                '&:has(input:focus-visible)': {
                  outline: '2px solid #7ea7fe',
                  outlineOffset: '2px',
                },
              }}
            >
              <input
                id={inputId}
                type="radio"
                name="wallet-bonus-amount"
                value={amt}
                checked={isSelected}
                onChange={() => setSelectedAmount(amt)}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              />
              ₹{formatNumber(amt)}
            </Box>
          );
        })}
      </Box>

      {/* Summary Row */}
      <Box
        aria-live="polite"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexDirection: { xs: 'column', '@media (min-width: 521px)': 'row' },
        }}
      >
        {/* Box 1: You add to wallet */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            boxSizing: 'border-box',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            p: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: '#B9C2F3',
              fontSize: '0.82rem',
              fontWeight: 500,
              mb: 0.5,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            You add to wallet
          </Typography>
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: { xs: '1.4rem', sm: '1.6rem' },
              lineHeight: 1.2,
              fontFamily: 'inherit',
            }}
          >
            ₹{formattedAmount}
          </Typography>
        </Box>

        {/* Plus divider (hidden when stacked <= 520px) */}
        <Box
          aria-hidden="true"
          sx={{
            display: { xs: 'none', '@media (min-width: 521px)': 'block' },
            color: 'rgba(255, 255, 255, 0.45)',
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          +
        </Box>

        {/* Box 2: You get as bonus */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            boxSizing: 'border-box',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            p: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: '#B9C2F3',
              fontSize: '0.82rem',
              fontWeight: 500,
              mb: 0.5,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            You get as bonus
          </Typography>
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: '#7ea7fe',
              fontWeight: 700,
              fontSize: { xs: '1.4rem', sm: '1.6rem' },
              lineHeight: 1.2,
              fontFamily: 'inherit',
            }}
          >
            {formattedBonus} points
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TopUpBonusBanner;

