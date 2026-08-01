import React from 'react';
import { Box, useTheme } from '@mui/material';

const IconBadge = ({ icon, size = 44, fontSize = 18, sx }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSize,
        flexShrink: 0,
        ...sx,
      }}
    >
      {icon}
    </Box>
  );
};

export default IconBadge;
