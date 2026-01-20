import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Card,
  CardContent,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  LocalLaundryService as LaundryIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Celebration as CelebrationIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAPI,
  updateNotificationPreferences,
} from '../../utils/api';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 380,
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(17, 25, 40, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    borderLeft: theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.08)',
  },
}));

const NotificationCard = styled(motion.div)(({ theme, isUnread }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: 12,
  overflow: 'hidden',
  cursor: 'pointer',
  background: isUnread
    ? theme.palette.mode === 'dark'
      ? 'rgba(102, 126, 234, 0.1)'
      : 'rgba(102, 126, 234, 0.05)'
    : theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
  border: `1px solid ${
    isUnread
      ? theme.palette.primary.main + '30'
      : theme.palette.divider
  }`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(-4px)',
    boxShadow: theme.shadows[4],
    background: isUnread
      ? theme.palette.mode === 'dark'
        ? 'rgba(102, 126, 234, 0.15)'
        : 'rgba(102, 126, 234, 0.08)'
      : theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function NotificationCenter({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: true,
    rewards: true,
    reminders: true,
    sound: true,
  });

  // Notification state will be managed by the parent component or context

  useEffect(() => {
    // Fetch notifications from API
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      let notificationData = response.data;
      if (notificationData && notificationData.data) {
        notificationData = notificationData.data;
      }
      if (!Array.isArray(notificationData)) {
        notificationData = [];
      }
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate to action URL if exists
    if (notification.actionUrl) {
      // Handle navigation
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationAPI(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    // Filter by type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(n => !n.isRead);
      } else {
        filtered = filtered.filter(n => n.type === selectedFilter);
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getNotificationIcon = (notification) => {
    const iconMap = {
      'order': <LaundryIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'payment': <PaymentIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'reward': <StarIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'promotion': <OfferIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'achievement': <CelebrationIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'reminder': <ScheduleIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'info': <InfoIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'warning': <WarningIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
      'success': <CheckIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />,
    };
    
    // If notification has an icon property that's a JSX element, use it
    if (notification.icon && React.isValidElement(notification.icon)) {
      return React.cloneElement(notification.icon, {
        sx: { color: `${notification.color}.main`, fontSize: 20 }
      });
    }
    
    // Otherwise, use the icon map based on notification type
    return iconMap[notification.type] || <NotificationsIcon sx={{ color: `${notification.color}.main`, fontSize: 20 }} />;
  };

  return (
    <>
      <StyledDrawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            background: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon color="primary" />
                </Badge>
                <Typography variant="h6" fontWeight={700}>
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => setSettingsOpen(true)}
                  sx={{ opacity: 0.7 }}
                >
                  <SettingsIcon />
                </IconButton>
                <IconButton size="small" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Mark All Read
              </Button>
              <Button
                size="small"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Filter
              </Button>
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.02)',
                },
              }}
            />
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${notifications.length})`} />
            <Tab label={`Unread (${unreadCount})`} />
          </Tabs>

          {/* Notifications List */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <TabPanel value={activeTab} index={0}>
              <AnimatePresence>
                {getFilteredNotifications().length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary',
                    }}>
                      <NotificationsOffIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1">
                        No notifications found
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
                  getFilteredNotifications().map((notification, index) => (
                    <NotificationCard
                      key={notification.id}
                      isUnread={!notification.isRead}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Card elevation={0} sx={{ background: 'transparent' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36,
                                bgcolor: `${notification.color}.main`,
                                color: 'white',
                              }}
                            >
                              {getNotificationIcon(notification)}
                            </Avatar>
                            
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight={notification.isRead ? 500 : 700}
                                  sx={{ 
                                    color: notification.isRead ? 'text.primary' : 'primary.main',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                {!notification.isRead && (
                                  <Box 
                                    sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      bgcolor: 'primary.main',
                                      flexShrink: 0,
                                    }} 
                                  />
                                )}
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: '0.8rem',
                                  lineHeight: 1.4,
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {notification.message}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Chip
                                    label={notification.type}
                                    size="small"
                                    color={notification.color}
                                    variant="outlined"
                                    sx={{ 
                                      fontSize: '0.65rem',
                                      height: 18,
                                      textTransform: 'capitalize',
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notification.id);
                                    }}
                                    sx={{ 
                                      width: 20, 
                                      height: 20,
                                      opacity: 0.6,
                                      '&:hover': { opacity: 1, color: 'error.main' },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </NotificationCard>
                  ))
                )}
              </AnimatePresence>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <AnimatePresence>
                {getFilteredNotifications().filter(n => !n.isRead).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary',
                    }}>
                      <CheckIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1">
                        All caught up!
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        No unread notifications
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
                  getFilteredNotifications().filter(n => !n.isRead).map((notification, index) => (
                    <NotificationCard
                      key={notification.id}
                      isUnread={true}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Card elevation={0} sx={{ background: 'transparent' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36,
                                bgcolor: `${notification.color}.main`,
                                color: 'white',
                              }}
                            >
                              {getNotificationIcon(notification)}
                            </Avatar>
                            
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight={700}
                                  sx={{ 
                                    color: 'primary.main',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                <Box 
                                  sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                  }} 
                                />
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: '0.8rem',
                                  lineHeight: 1.4,
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {notification.message}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Chip
                                    label={notification.type}
                                    size="small"
                                    color={notification.color}
                                    variant="outlined"
                                    sx={{ 
                                      fontSize: '0.65rem',
                                      height: 18,
                                      textTransform: 'capitalize',
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notification.id);
                                    }}
                                    sx={{ 
                                      width: 20, 
                                      height: 20,
                                      opacity: 0.6,
                                      '&:hover': { opacity: 1, color: 'error.main' },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </NotificationCard>
                  ))
                )}
              </AnimatePresence>
            </TabPanel>
          </Box>
        </Box>
      </StyledDrawer>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        {['all', 'unread', 'order', 'payment', 'reward', 'promotion'].map((filter) => (
          <MenuItem
            key={filter}
            selected={selectedFilter === filter}
            onClick={() => {
              setSelectedFilter(filter);
              setFilterAnchorEl(null);
            }}
            sx={{ textTransform: 'capitalize' }}
          >
            {filter}
          </MenuItem>
        ))}
      </Menu>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Notification Settings
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {Object.entries(notificationSettings).map(([key, value]) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={value}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))}
                  />
                }
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}