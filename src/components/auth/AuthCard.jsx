import React from 'react';
import { Card, Box } from '@mui/material';

const AuthCard = ({ children, sx = {} }) => {
  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 480,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
        borderRadius: 3,
        ...sx
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)',
        }}
      />
      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        {children}
      </Box>
    </Card>
  );
};

export default AuthCard;
