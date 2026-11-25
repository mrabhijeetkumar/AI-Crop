import React, { createContext, useContext } from 'react';
import { useFarm } from './FarmContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const farm = useFarm();
  
  const value = {
    notifications: farm?.notifications || [],
    unreadCount: farm?.unreadNotificationCount || 0,
    unreadNotificationCount: farm?.unreadNotificationCount || 0,
    markAsRead: farm?.markNotificationAsRead || (() => {}),
    markAllAsRead: farm?.markAllNotificationsAsRead || (() => {}),
    markNotificationAsRead: farm?.markNotificationAsRead || (() => {}),
    markAllNotificationsAsRead: farm?.markAllNotificationsAsRead || (() => {}),
    deleteNotification: farm?.deleteNotification || (() => {}),
    clearAllNotifications: farm?.clearAllNotifications || (() => {}),
    addNotification: farm?.addNotification || (() => {}),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  const farm = useFarm();

  if (context) return context;

  return {
    notifications: farm?.notifications || [],
    unreadCount: farm?.unreadNotificationCount || 0,
    unreadNotificationCount: farm?.unreadNotificationCount || 0,
    markAsRead: farm?.markNotificationAsRead || (() => {}),
    markAllAsRead: farm?.markAllNotificationsAsRead || (() => {}),
    markNotificationAsRead: farm?.markNotificationAsRead || (() => {}),
    markAllNotificationsAsRead: farm?.markAllNotificationsAsRead || (() => {}),
    deleteNotification: farm?.deleteNotification || (() => {}),
    clearAllNotifications: farm?.clearAllNotifications || (() => {}),
    addNotification: farm?.addNotification || (() => {}),
  };
}
