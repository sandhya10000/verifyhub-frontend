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
          height: '4px',
          background: 'linear-gradient(to right, #E74C3C, #F39C12, #F1C40F, #12B886)',
        }}
      />
      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        {children}
      </Box>
    </Card>
  );
};

export default AuthCard;
