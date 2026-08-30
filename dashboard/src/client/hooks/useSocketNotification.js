import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../lib/api-client';
import { useAuthStore } from '../store/useAuthStore';
import { usePortalStore } from '../store/usePortalStore';
import { toast } from 'sonner';

/**
 * Custom hook to establish Socket.io WebSocket connection and handle real-time notifications
 * for the Client Dashboard.
 */
export function useSocketNotification() {
  const user = useAuthStore((state) => state.user);
  const addNotification = usePortalStore((state) => state.addNotification);
  const socketRef = useRef(null);

  useEffect(() => {
    // Derive base server URL for WebSocket connection
    let serverUrl = API_BASE_URL;
    try {
      if (typeof window !== 'undefined') {
        const isLocalhost =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
          // Point to local backend server port 4000
          serverUrl = 'http://127.0.0.1:4000';
        } else if (API_BASE_URL) {
          const parsed = new URL(API_BASE_URL);
          serverUrl = parsed.origin;
        }
      }
    } catch {
      serverUrl = API_BASE_URL || 'http://127.0.0.1:4000';
    }

    const socket = io(serverUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      const userDid = user?.did || user?.id || user?._id;
      if (userDid) {
        socket.emit('join_room', userDid);
      }
    });

    socket.on('connect_error', () => {
      // Graceful reconnecting in background
    });

    // Listen for real-time notification events emitted from backend
    socket.on('new_notification', (data) => {
      if (!data) return;

      // Avoid duplicate popup for identical self-action unless it's workflow/system alert
      const isSelfAction =
        (user?.name && data.createdBy === user.name) ||
        (user?.email && data.createdBy === user.email);

      if (isSelfAction && data.module !== 'system_alert' && data.module !== 'visa' && data.module !== 'task') {
        return;
      }

      // Add to store for live badge & dropdown sync
      addNotification({
        id: data.did || data._id || Date.now(),
        did: data.did,
        title: data.title || 'System Update',
        message: data.message || '',
        module: data.module || 'general',
        type: data.type || 'info',
        time: 'Just now',
        createdAt: data.createdAt || new Date().toISOString(),
        unread: true,
      });

      // Show live interactive toast banner
      toast(data.title || 'New Notification', {
        description: data.message || '',
        duration: 5000,
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.did, user?.id, user?._id, user?.name, user?.email, addNotification]);

  return socketRef.current;
}

export default useSocketNotification;
