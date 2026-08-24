import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const StatCard = ({ title, value, subtitle, trend, chipLabel, variant = 'default', decoration }) => {
  const isDark = variant === 'dark';
  
  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: isDark ? 'secondary.main' : 'background.paper',
      color: isDark ? 'primary.contrastText' : 'text.primary',
      borderColor: isDark ? 'secondary.main' : 'divider'
    }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative', overflow: 'hidden' }}>
        {decoration && (
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 0, pointerEvents: 'none' }}>
            {decoration}
          </Box>
        )}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="overline" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', mb: 1 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1 }}>
          <Typography variant="h3" sx={{ color: isDark ? 'primary.main' : 'text.primary', fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {trend && (
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              ▲ {trend}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
              {trend ? `vs yesterday · ${subtitle}` : subtitle}
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
