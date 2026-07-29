import React from 'react';
import { Box, Typography } from '@mui/material';

const PlaceholderPage = ({ title }) => (
  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
    <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
    <Typography variant="body1">This page is a placeholder for routing purposes.</Typography>
  </Box>
);

export default PlaceholderPage;
