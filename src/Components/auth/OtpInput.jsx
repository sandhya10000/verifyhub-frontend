import React, { useRef } from 'react';
import { Box, TextField } from '@mui/material';

const OtpInput = ({ value, onChange, disabled }) => {
  const refs = useRef([]);

  const setDigit = (idx, digit) => {
    const next = value.split('');
    while (next.length < 6) next.push('');
    next[idx] = digit;
    onChange(next.join('').slice(0, 6));
  };

  const handleChange = (idx) => (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(-1);
    setDigit(idx, d);
    if (d && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      e.preventDefault();
      onChange(text);
      refs.current[Math.min(text.length, 5)]?.focus();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }} onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <TextField
          key={i}
          inputRef={(el) => (refs.current[i] = el)}
          value={value[i] || ''}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          disabled={disabled}
          inputProps={{ maxLength: 1, inputMode: 'numeric', style: { textAlign: 'center', fontSize: 22, fontWeight: 700 } }}
          sx={{ width: 52 }}
        />
      ))}
    </Box>
  );
};

export default OtpInput;
