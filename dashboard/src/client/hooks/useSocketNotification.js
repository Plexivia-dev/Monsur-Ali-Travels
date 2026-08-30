import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePortalStore } from '../store/usePortalStore';
import { getSocket, joinUserRoom } from '@shared/lib/socket';
import { toast } from 'sonner';

/**
 * Custom hook to establish Socket.io connection and handle real-time notifications
 * for the Client Dashboard using the shared singleton gateway.
 */
export function useSocketNotification() {
  const user = useAuthStore((state) => state.user);
  const addNotification = usePortalStore((state) => state.addNotification);
  const fetchNotifications = usePortalStore((state) => state.fetchNotifications);

  useEffect(() => {
    const userDid = user?.did || user?.id || user?._id;
    if (userDid) {
      joinUserRoom(userDid);
      fetchNotifications(userDid);
    }

    const socket = getSocket();

    const handleNewNotification = (data) => {
      if (!data) return;

      const notifId = data.did || data._id || data.id || Date.now();
      const notifType = data.type === 'danger' || data.type === 'error'
        ? 'error'
        : data.type === 'warning'
        ? 'warning'
        : 'info';

      // Add to portal store for live badge & dropdown sync
      addNotification({
        id: notifId,
        did: data.did || notifId,
        title: data.title || 'System Update',
        message: data.message || '',
        module: data.module || 'general',
        type: data.type || 'info',
        time: 'Just now',
        createdAt: data.createdAt || new Date().toISOString(),
        unread: true,
        isRead: false,
      });

      // Show live interactive toast banner
      if (notifType === 'error') {
        toast.error(data.title || 'System Alert', { description: data.message || '' });
      } else if (notifType === 'warning') {
        toast.warning(data.title || 'System Warning', { description: data.message || '' });
      } else {
        toast.info(data.title || 'New Notification', { description: data.message || '' });
      }
    };

    socket.off('new_notification', handleNewNotification);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [user?.did, user?.id, user?._id, addNotification, fetchNotifications]);

  return getSocket();
}

export default useSocketNotification;
