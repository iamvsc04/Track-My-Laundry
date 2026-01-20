# TrackMyLaundry - Notification System

This directory contains the comprehensive notification system for the TrackMyLaundry application.

## Components

### 1. NotificationCenter.jsx
A full-featured notification management drawer with:
- **Real-time notifications** - Order updates, payments, rewards, promotions
- **Search & Filter** - Find notifications by text or type
- **Mark as Read/Unread** - Individual or bulk actions
- **Settings Management** - Configure notification preferences
- **Beautiful Animations** - Smooth transitions and hover effects
- **Responsive Design** - Works on mobile and desktop
- **Tabs** - Separate All and Unread notifications

**Features:**
- Glassmorphic design with blur effects
- Animated notification cards
- Delete notifications
- Navigate to related content
- Notification badges and icons
- Real-time timestamps using date-fns

### 2. NotificationBadge.jsx
A reusable notification badge component that:
- **Shows unread count** with animated badge
- **Opens NotificationCenter** when clicked
- **Animated interactions** - Hover and tap animations
- **Customizable** - Size, color, styling options
- **Tooltip support** - Shows notification count
- **Responsive icons** - Different icons for read/unread states

**Props:**
- `unreadCount` - Number of unread notifications
- `size` - 'small', 'medium', 'large'
- `color` - Theme color variant
- `showTooltip` - Show/hide tooltip
- `sx` - Custom styling

### 3. useNotifications Hook (../hooks/useNotifications.js)
Provides comprehensive notification state management:
- **Fetch notifications** from API
- **Real-time updates** - Add, mark as read, delete
- **Filter and search** - Advanced filtering options
- **Settings management** - User preferences
- **Mock API** - Ready for backend integration

**Context Provider:**
```jsx
import { NotificationProvider } from '../hooks/useNotifications';

<NotificationProvider>
  <YourApp />
</NotificationProvider>
```

## Usage Examples

### Basic Notification Badge
```jsx
import { NotificationBadge } from '../components/Notifications';

<NotificationBadge 
  unreadCount={5}
  size="medium"
  color="primary"
/>
```

### Notification Center
```jsx
import { NotificationCenter } from '../components/Notifications';

const [open, setOpen] = useState(false);

<NotificationCenter 
  open={open} 
  onClose={() => setOpen(false)} 
/>
```

### With Notification Hook
```jsx
import { useNotifications } from '../hooks/useNotifications';

const { unreadCount, notifications, markAsRead } = useNotifications();

<NotificationBadge unreadCount={unreadCount} />
```

## Integration

The notification system is already integrated in:

1. **Dashboard.jsx** - Header notification icon
2. **EnhancedDashboard.jsx** - Header notification icon  
3. **Profile.jsx** - Profile page with notification preferences

## Theming

Components support both light and dark themes with:
- Dynamic color schemes
- Glassmorphic backgrounds
- Consistent spacing and typography
- Smooth animations and transitions

## API Integration

The notification system is now fully integrated with the existing API endpoints from `utils/api.js`:

- `getNotifications()` - Fetch all notifications
- `markNotificationAsRead(id)` - Mark single notification as read
- `markAllNotificationsAsRead()` - Mark all notifications as read
- `deleteNotification(id)` - Delete a notification
- `updateNotificationPreferences(settings)` - Update notification settings

All API calls include proper authentication headers and error handling.

### Backend Requirements

Your backend should implement these endpoints:

```javascript
GET    /api/notifications           // Get notifications
PATCH  /api/notifications/:id/read  // Mark as read
PATCH  /api/notifications/read-all  // Mark all as read
DELETE /api/notifications/:id       // Delete notification
PUT    /api/auth/notification-preferences // Update settings
```

## Dependencies

- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `framer-motion` - Animations
- `date-fns` - Date formatting
- `react-toastify` - Toast notifications

## Future Enhancements

- Real-time WebSocket notifications
- Push notification support
- Email/SMS notification templates
- Advanced filtering and sorting
- Notification categories and priorities
- Bulk operations
- Export notification history