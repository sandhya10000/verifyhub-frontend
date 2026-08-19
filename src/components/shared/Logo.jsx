import React from 'react';
import logoImg from '../../assets/logo.jpeg';

/**
 * Shared VerifyHub logo component.
 *
 * Props:
 *   height  – rendered height in px (width scales automatically via aspect-ratio).
 *             Defaults to 36. Use larger values for auth panels (80–100).
 *   style   – additional inline styles forwarded to the <img>.
 *   className – CSS class forwarded to the <img>.
 */
const Logo = ({ height = 36, style = {}, className = '', alt = 'VerifyHub' }) => {
  return (
    <img
      src={logoImg}
      alt={alt}
      height={height}
      className={className}
      style={{
        width: 'auto',
        display: 'block',
        borderRadius: Math.round(height * 0.25) + 'px', // keep pill corners proportional
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

export default Logo;
