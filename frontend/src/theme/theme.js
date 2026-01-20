import { createTheme } from '@mui/material/styles';

// Define color palette
const palette = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    main: '#0ea5e9',
    dark: '#0284c7',
    light: '#38bdf8',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    main: '#d946ef',
    dark: '#c026d3',
    light: '#e879f9',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    main: '#10b981',
    dark: '#059669',
    light: '#34d399',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    main: '#f59e0b',
    dark: '#d97706',
    light: '#fbbf24',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    main: '#ef4444',
    dark: '#dc2626',
    light: '#f87171',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    main: '#0ea5e9',
    dark: '#0284c7',
    light: '#38bdf8',
  },
};

// 🎭 Animation & Motion Design Tokens
const animationTokens = {
  // Duration tokens
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
    slow: 500,
    slower: 750,
    slowest: 1000,
  },
  
  // Easing tokens
  easing: {
    // Material Design easing curves
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    
    // Custom easing curves for enhanced feel
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    backOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    anticipate: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  
  // Spring physics for framer-motion
  spring: {
    gentle: { type: 'spring', stiffness: 120, damping: 14 },
    wobbly: { type: 'spring', stiffness: 180, damping: 12 },
    stiff: { type: 'spring', stiffness: 400, damping: 30 },
    slow: { type: 'spring', stiffness: 60, damping: 15 },
    molasses: { type: 'spring', stiffness: 40, damping: 20 },
  },
  
  // Enhanced shadow tokens
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
    elevated: '0 20px 60px rgba(0, 0, 0, 0.1)',
    floating: '0 12px 40px rgba(0, 0, 0, 0.15)',
    pressed: '0 2px 8px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3)',
  },
};

// Common component overrides
const getComponentOverrides = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'dark' ? '#1e293b' : '#f1f5f9',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? '#475569' : '#cbd5e1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: mode === 'dark' ? '#64748b' : '#94a3b8',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        transition: `all ${animationTokens.duration.standard}ms ${animationTokens.easing.easeOut}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: animationTokens.shadows.floating,
          transform: 'translateY(-2px) scale(1.02)',
        },
        '&:active': {
          transform: 'translateY(0) scale(1)',
          boxShadow: animationTokens.shadows.pressed,
          transition: `all ${animationTokens.duration.shorter}ms ${animationTokens.easing.easeIn}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          transition: `left ${animationTokens.duration.slow}ms ${animationTokens.easing.easeOut}`,
        },
        '&:hover::before': {
          left: '100%',
        },
      },
      contained: {
        background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`,
        boxShadow: animationTokens.shadows.elevated,
        '&:hover': {
          background: `linear-gradient(135deg, ${palette.primary.dark}, ${palette.primary[800]})`,
          boxShadow: `${animationTokens.shadows.floating}, ${animationTokens.shadows.glow}`,
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
});

// Light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...palette,
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.9)',
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
    glass: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  // Add animation tokens
  animation: animationTokens,
  components: getComponentOverrides('light'),
});

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...palette,
    background: {
      default: '#0f172a',
      paper: 'rgba(30, 41, 59, 0.8)',
      gradient: 'radial-gradient(1200px 600px at 0% 0%, rgba(102,126,234,0.25), transparent), radial-gradient(1200px 600px at 100% 100%, rgba(118,75,162,0.25), transparent), linear-gradient(180deg, #0f172a, #111827)',
      cardGradient: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#f8fafc',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#f8fafc',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: '#f8fafc',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#f8fafc',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#f8fafc',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: '#f8fafc',
    },
  },
  // Add animation tokens
  animation: animationTokens,
  components: getComponentOverrides('dark'),
});

export { lightTheme, darkTheme };
