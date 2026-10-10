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
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
