import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4F8EF7',
      light: '#6FA3FF',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0A0A',
      paper: '#111111',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.6)',
      disabled: 'rgba(255,255,255,0.3)',
    },
    divider: 'rgba(255,255,255,0.06)',
    action: {
      hover: 'rgba(255,255,255,0.05)',
      selected: 'rgba(79,142,247,0.12)',
      focus: 'rgba(255,255,255,0.08)',
    },
    error: { main: '#FF453A' },
    success: { main: '#4F8EF7' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
    h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.4 },
    caption: { fontSize: '0.75rem', letterSpacing: '0.01em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#333 transparent',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#333', borderRadius: 3, '&:hover': { background: '#444' } },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 28px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: '#4F8EF7',
          color: '#fff',
          '&:hover': {
            background: '#6FA3FF',
            transform: 'scale(1.02)',
            boxShadow: '0 4px 20px rgba(79,142,247,0.4)',
          },
          '&.Mui-disabled': { background: 'rgba(79,142,247,0.3)', color: 'rgba(0,0,0,0.4)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '1px 0',
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            background: 'rgba(79,142,247,0.12)',
            color: '#4F8EF7',
            '& .MuiListItemIcon-root': { color: '#4F8EF7' },
            '&:hover': { background: 'rgba(79,142,247,0.18)' },
          },
          '&:hover': { background: 'rgba(255,255,255,0.06)' },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, color: 'rgba(255,255,255,0.5)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)', transition: 'border-color 0.2s ease' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#4F8EF7', borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#4F8EF7' },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { background: 'rgba(255,255,255,0.07)' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(255,255,255,0.06)' } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
        standardError: { background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#FF6B61' },
        standardSuccess: { background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', color: '#6FA3FF' },
      },
    },
    MuiCircularProgress: {
      styleOverrides: { colorPrimary: { color: '#4F8EF7' } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { background: '#2A2A2A', fontSize: '0.75rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': { background: 'rgba(255,255,255,0.08)' },
        },
      },
    },
  },
});

export default theme;
