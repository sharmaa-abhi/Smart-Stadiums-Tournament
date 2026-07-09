import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const MAX_NOTIFICATIONS = 50;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const eventSourceRef = useRef(null);

  // Connect to SSE stream when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up on logout
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem('sg_token');
    if (!token) return;

    const sseUrl = `http://localhost:5000/api/notifications/stream?token=${token}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications(prev => {
          const next = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return next;
        });
        setUnreadCount(prev => prev + 1);
      } catch (err) {
        console.error('Failed to parse notification:', err);
      }
    };

    es.onerror = () => {
      // SSE will auto-reconnect
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isAuthenticated]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      const wasUnread = target && !target.read;
      const next = prev.filter(n => n.id !== id);
      if (wasUnread) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllRead,
      dismissNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
