import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsOffIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import NotificationCenter from './NotificationCenter';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(45deg, #ff6b6b 0%, #ff8e53 100%)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    border: `2px solid ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const AnimatedIconButton = styled(motion.div)(({ theme }) => ({
  display: 'inline-flex',
}));

export default function NotificationBadge({ 
  unreadCount = 0,
  size = 'medium',
  showTooltip = true,
  color = 'default',
  variant = 'standard',
  className,
  sx,
  ...props 
}) {
  const theme = useTheme();
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setNotificationCenterOpen(true);
  };

  const buttonVariants = {
    idle: { 
      scale: 1,
      rotate: 0,
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        rotate: {
          duration: 0.5,
          ease: "easeInOut",
        },
        scale: {
          duration: 0.2,
          ease: "easeInOut",
        }
      }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
  };

  const BadgeComponent = (
    <StyledBadge
      badgeContent={unreadCount}
      color="error"
      variant={variant}
      max={99}
      invisible={unreadCount === 0}
      overlap="circular"
    >
      {unreadCount > 0 ? (
        <NotificationsIcon 
          sx={{ 
            fontSize: getIconSize(),
            color: color === 'default' ? 'inherit' : `${color}.main`,
          }} 
        />
      ) : (
        <NotificationsOffIcon 
          sx={{ 
            fontSize: getIconSize(),
            color: color === 'default' ? 'text.secondary' : `${color}.main`,
            opacity: 0.7,
          }} 
        />
      )}
    </StyledBadge>
  );

  const AnimatedButton = (
    <AnimatedIconButton
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
    >
      <IconButton
        onClick={handleClick}
        size={getButtonSize()}
        className={className}
        sx={{
          transition: 'all 0.3s ease',
          ...sx,
        }}
        {...props}
      >
        {BadgeComponent}
      </IconButton>
    </AnimatedIconButton>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip 
          title={
            unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'No new notifications'
          }
          arrow
          placement="bottom"
        >
          {AnimatedButton}
        </Tooltip>
      ) : (
        AnimatedButton
      )}

      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </>
  );
}