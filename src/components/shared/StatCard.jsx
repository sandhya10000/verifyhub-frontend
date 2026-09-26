import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const StatCard = ({ title, value, subtitle, trend, chipLabel, variant = 'default', decoration, compact = false }) => {
  const isDark = variant === 'dark';
  
  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: isDark ? 'secondary.main' : 'background.paper',
      color: isDark ? 'primary.contrastText' : 'text.primary',
      borderColor: isDark ? 'secondary.main' : 'divider',
      borderRadius: 2.5,
      boxShadow: 'none',
      border: '1px solid',
    }}>
      <CardContent sx={{ p: compact ? 2 : 3, '&:last-child': { pb: compact ? 2 : 3 }, position: 'relative', overflow: 'hidden' }}>
        {decoration && (
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 0, pointerEvents: 'none' }}>
            {decoration}
          </Box>
        )}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="overline" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', mb: 0.5, fontSize: compact ? '0.62rem' : undefined, letterSpacing: '0.06em' }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 0.5 }}>
          <Typography variant={compact ? 'h5' : 'h3'} sx={{ color: isDark ? 'primary.main' : 'text.primary', fontWeight: 800, letterSpacing: '-0.01em' }}>
            {value}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {trend && (
            <Typography variant="caption" sx={{ color: String(trend).includes('▼') ? 'error.main' : 'success.main', fontWeight: 700, display: 'flex', alignItems: 'center', fontSize: '0.72rem' }}>
              {trend}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', fontSize: '0.72rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
          {chipLabel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block' }}>
                {chipLabel}
              </Typography>
              <Box sx={{ width: '100%', height: 4, mt: 1, borderRadius: 2, background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)' }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
