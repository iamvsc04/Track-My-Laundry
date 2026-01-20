import React from 'react';
import {
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Box,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as Brightness4Icon,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

// Simple icon toggle button
export const ThemeToggleIcon = ({ size = 'medium', showTooltip = true }) => {
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const button = (
    <IconButton
      onClick={toggleTheme}
      size={size}
      sx={{
        color: muiTheme.palette.text.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: `1px solid ${muiTheme.palette.divider}`,
        borderRadius: '50%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          transform: 'rotate(180deg) scale(1.1)',
        },
      }}
    >
      {themeMode === 'dark' ? (
        <LightModeIcon fontSize={size} />
      ) : (
        <DarkModeIcon fontSize={size} />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
        arrow
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};

// Switch style toggle
export const ThemeToggleSwitch = ({ showLabels = false }) => {
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  if (showLabels) {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={themeMode === 'dark'}
            onChange={toggleTheme}
            icon={<LightModeIcon />}
            checkedIcon={<DarkModeIcon />}
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: muiTheme.palette.primary.main,
              },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {themeMode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
            {themeMode === 'dark' ? 'Dark' : 'Light'}
          </Box>
        }
      />
    );
  }

  return (
    <Switch
      checked={themeMode === 'dark'}
      onChange={toggleTheme}
      icon={<LightModeIcon fontSize="small" />}
      checkedIcon={<DarkModeIcon fontSize="small" />}
      sx={{
        '& .MuiSwitch-thumb': {
          backgroundColor: muiTheme.palette.primary.main,
        },
      }}
    />
  );
};

// Animated theme toggle button
export const AnimatedThemeToggle = ({ size = 'medium' }) => {
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip
      title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        size={size}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: muiTheme.palette.text.primary,
          backgroundColor: muiTheme.palette.background.paper,
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: muiTheme.palette.action.hover,
            transform: 'scale(1.05)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: themeMode === 'dark' ? '50%' : '0%',
            width: '50%',
            height: '100%',
            backgroundColor: muiTheme.palette.primary.main,
            borderRadius: '6px',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <LightModeIcon
            fontSize="small"
            sx={{
              color:
                themeMode === 'light'
                  ? muiTheme.palette.primary.contrastText
                  : muiTheme.palette.text.secondary,
              transition: 'color 0.3s ease',
            }}
          />
          <DarkModeIcon
            fontSize="small"
            sx={{
              color:
                themeMode === 'dark'
                  ? muiTheme.palette.primary.contrastText
                  : muiTheme.palette.text.secondary,
              transition: 'color 0.3s ease',
            }}
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
};

// Default export - simple icon toggle
export default ThemeToggleIcon;
