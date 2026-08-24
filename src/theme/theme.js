import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',    // home page blue
      dark: '#1D4ED8',    // home page blue-dk
      light: '#EFF4FF',   // home page blue-bg
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0A1628',    // home page navy
      dark: '#16294A',    // home page navy-3
    },
    background: {
      default: '#F6F8FB', // home page bg-soft
      paper: '#FFFFFF',
    },
    error: {
      main: '#C0392B',
      light: '#FDECEC',
    },
    success: {
      main: '#1b22a7',    // home page blue
      light: '#ECFDF5',   // home page green-bg
    },
    text: {
      primary: '#0F1B2D', // home page ink
      secondary: '#475569', // home page slate
      disabled: '#94A3B8',
    },
    divider: '#E5EAF1',   // home page line
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "sans-serif"',
    h1: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600 },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#64748B', // home page slate-lt
    },
    fontFamilyMono: '"JetBrains Mono", "Roboto Mono", monospace',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 24px',
          boxShadow: 'none',
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          fontWeight: 600,
          fontSize: '15px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)',
          boxShadow: '0 1px 2px rgba(37,99,235,.45), 0 8px 24px rgba(37,99,235,.28), inset 0 1px 0 rgba(255,255,255,.22)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-80%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,.35), transparent)',
            transform: 'skewX(-20deg)',
            transition: 'left .5s ease',
          },
          '&:hover': {
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 32px rgba(37,99,235,.45), inset 0 1px 0 rgba(255,255,255,.25)',
            '&::after': {
              left: '130%',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(15,27,45,.08)',
          border: '1px solid #E5EAF1',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#C3CFE0',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563EB',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#2563EB',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#CBD5E1',
          '&.Mui-checked': {
            color: '#2563EB',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#2563EB',
        },
      },
    },
  },
});

export default theme;
