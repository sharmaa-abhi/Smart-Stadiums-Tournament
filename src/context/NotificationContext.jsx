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

    // SECURITY: Use SSE endpoint without token in URL.
    // The Express notification stream now accepts Bearer token via header.
    // Since native EventSource doesn't support custom headers, we use
    // a fetch-based SSE approach.
    const sseUrl = `${import.meta.env.VITE_SSE_BASE_URL || 'http://localhost:5000'}/api/notifications/stream`;
    let controller = new AbortController();

    async function connectSSE() {
      try {
        const response = await fetch(sseUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) return;
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const notification = JSON.parse(line.slice(6));
                setNotifications(prev => {
                  const next = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
                  return next;
                });
                setUnreadCount(prev => prev + 1);
              } catch { /* skip malformed data */ }
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Reconnect after 5 seconds on error
          setTimeout(connectSSE, 5000);
        }
      }
    }

    connectSSE();

    return () => {
      controller.abort();
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
