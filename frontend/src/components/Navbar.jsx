import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  LocalLaundryService as LaundryIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ThemeToggleIcon } from './ThemeToggle';
import NotificationBadge from './Notifications/NotificationBadge';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Create Order', icon: <AddIcon />, path: '/create-order' },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70 }}>
        {/* Brand / Logo */}
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
          onClick={() => navigate('/dashboard')}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar
              sx={{
                bgcolor: 'transparent',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: 40,
                height: 40,
              }}
            >
              <LaundryIcon sx={{ color: 'white' }} />
            </Avatar>
          </motion.div>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontWeight: 800,
              color: theme.palette.primary.main,
              display: { xs: 'none', sm: 'block' },
              letterSpacing: -0.5,
            }}
          >
            TrackMyLaundry
          </Typography>
        </Box>

        {/* Navigation Links (Desktop) */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, mx: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path 
                    ? 'primary.main' 
                    : 'text.secondary',
                  bgcolor: location.pathname === item.path 
                    ? (theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)')
                    : 'transparent',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ThemeToggleIcon />
          
          <NotificationBadge />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{
                  ml: 0.5,
                  p: 0.5,
                  border: `2px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Box onClick={handleMenu} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                  {user?.name?.split(' ')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {user?.role || 'User'}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                width: 200,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, mb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle1" fontWeight="bold">Account</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
            </Box>
            
            <MenuItem onClick={() => navigate('/profile')}>
              <PersonIcon fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} /> Profile
            </MenuItem>
            {isMobile && menuItems.map(item => (
              <MenuItem key={item.path} onClick={() => navigate(item.path)}>
                {item.icon} <Box component="span" sx={{ ml: 2 }}>{item.label}</Box>
              </MenuItem>
            ))}
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', mt: 1 }}>
              <LogoutIcon fontSize="small" sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
