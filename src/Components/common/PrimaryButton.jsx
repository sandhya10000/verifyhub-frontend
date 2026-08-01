import React from 'react';
import { Button } from '@mui/material';

const PrimaryButton = ({ children, sx, ...props }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        borderRadius: '10px',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
