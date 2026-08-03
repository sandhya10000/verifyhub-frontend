import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const SectionHeading = ({ eyebrow, title, subtext, sx, alignment = 'left' }) => {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: alignment, display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      {eyebrow && (
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 700,
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {eyebrow}
        </Typography>
      )}
      
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '28px', md: '36px' },
          color: theme.palette.text.primary,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      
      {subtext && (
        <Typography
          sx={{
            fontSize: '16px',
            color: theme.palette.text.secondary,
            maxWidth: alignment === 'center' ? '800px' : '600px',
            mx: alignment === 'center' ? 'auto' : 0,
          }}
        >
          {subtext}
        </Typography>
      )}
    </Box>
  );
};

export default SectionHeading;
