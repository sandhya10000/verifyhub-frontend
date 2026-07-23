import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#12B886', // teal-green accent
      dark: '#0FBF8F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0B1B2B', // deep navy
      dark: '#0D2136',
    },
    background: {
      default: '#F5F6F8', // light neutral gray
      paper: '#FFFFFF',
    },
    error: {
      main: '#C0392B',
      light: '#FDECEC', // error background pill
    },
    success: {
      main: '#127A5C',
      light: '#E7F7F1', // success background pill
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB', // subtle 1px border
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "sans-serif"',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    overline: { // Used for micro-labels
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: '#6B7280', // muted gray
    },
    fontFamilyMono: '"JetBrains Mono", "Roboto Mono", monospace',
  },
  shape: {
    borderRadius: 12, // 12px-16px as requested
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // full width rounded button
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid #E5E7EB',
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
          },
        },
      },
    },
  },
});

export default theme;
