import React from 'react';
import { Box, Typography, TextField, useTheme } from '@mui/material';

const FormField = ({ label, required, ...props }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {label && (
        <Typography
          component="label"
          htmlFor={props.id || props.name}
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: theme.palette.text.secondary,
          }}
        >
          {label} {required && '*'}
        </Typography>
      )}
      <TextField
        fullWidth
        required={required}
        {...props}
        sx={{
          '& .MuiInputBase-input': {
            padding: '12px 16px',
            fontSize: '15px',
          },
          ...props.sx,
        }}
      />
    </Box>
  );
};

export default FormField;
