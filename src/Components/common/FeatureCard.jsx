import React, { forwardRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import IconBadge from './IconBadge';

const FeatureCard = forwardRef(({ 
  icon, 
  iconColor = 'primary', // 'primary', 'success', 'warning' etc.
  title, 
  description, 
  points = [], 
  linkText = "Explore API →", 
  linkHref = "#contact",
  isNew = false,
  className = ""
}, ref) => {
  const theme = useTheme();

  let badgeColor = theme.palette.primary.main;
  let badgeBg = theme.palette.primary.light;
  if (iconColor === 'success' || iconColor === 'green') {
    badgeColor = theme.palette.success.main;
    badgeBg = theme.palette.success.light;
  } else if (iconColor === 'warning' || iconColor === 'gold') {
    badgeColor = '#D97706'; // Gold/Warning color
    badgeBg = '#FEF3C7';
  }

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        p: 4,
        background: theme.palette.background.paper,
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(15,27,45,.08)',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(15,27,45,.12)',
        },
        height: '100%',
      }}
    >
      {isNew && (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: theme.palette.error.main,
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            padding: '4px 10px',
            borderRadius: '100px',
            textTransform: 'uppercase',
          }}
        >
          NEW
        </Box>
      )}

      <IconBadge 
        icon={icon} 
        size={48} 
        fontSize={24} 
        sx={{ 
          color: badgeColor, 
          backgroundColor: badgeBg, 
          mb: 3 
        }} 
      />
      
      <Typography variant="h3" sx={{ fontSize: '18px', mb: 1.5, color: theme.palette.text.primary }}>
        {title}
      </Typography>
      
      <Typography sx={{ fontSize: '15px', color: theme.palette.text.secondary, mb: 3, lineHeight: 1.6 }}>
        {description}
      </Typography>

      {points.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4, mt: 'auto' }}>
          {points.map((pt, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box component="span" sx={{ color: theme.palette.success.main, fontSize: '16px', lineHeight: 1.4 }}>✓</Box>
              <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary, fontWeight: 500 }}>
                {pt}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box
        component="a"
        href={linkHref}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '14.5px',
          fontWeight: 600,
          color: theme.palette.primary.main,
          textDecoration: 'none',
          mt: points.length > 0 ? 0 : 'auto',
          '&:hover': {
            textDecoration: 'underline',
          }
        }}
      >
        {linkText}
      </Box>
    </Box>
  );
});

export default FeatureCard;
