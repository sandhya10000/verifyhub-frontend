import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ label = 'Password', InputProps: customInputProps, slotProps: customSlotProps, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      {...props}
      label={label}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        ...customSlotProps,
        input: {
          ...customInputProps,
          ...customSlotProps?.input,
          sx: {
            pr: 1,
            '& input': {
              pr: '42px', // ensures text never goes under the endAdornment icon
            },
            ...customInputProps?.sx,
            ...customSlotProps?.input?.sx,
          },
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                m: 0,
                pointerEvents: 'auto',
              }}
            >
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
                aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                sx={{
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  p: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
