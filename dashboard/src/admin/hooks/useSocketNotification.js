import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/store/useAuthStore';

/**
 * Custom hook to establish Socket.io connection and handle real-time notifications for the admin dashboard.
 */
export function useSocketNotification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    // Extract base server URL without trailing path
    let serverUrl = API_BASE_URL;
    try {
      const parsed = new URL(API_BASE_URL);
      serverUrl = parsed.origin;
    } catch {
      serverUrl = API_BASE_URL;
    }

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (user?.did) {
        socket.emit('join_room', user.did);
      }
    });

    // Listen for real-time notification events
    socket.on('new_notification', (data) => {
      if (!data) return;

      const notifType = data.type === 'danger' ? 'error' : data.type || 'info';

      toast.add({
        title: data.title || 'System Notification',
        description: data.message || '',
        type: notifType,
        actionProps: {
          children: 'View Logs',
          onClick: () => navigate('/admin/activity-logs'),
        },
      });
    });

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.did, navigate]);

  return socketRef.current;
}

export default useSocketNotification;
