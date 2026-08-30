import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { getSocket, joinUserRoom } from '@shared/lib/socket';
import { toast } from 'sonner';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isInitialized: false,

  initSocket: (userDid) => {
    if (get().isInitialized) {
      if (userDid) joinUserRoom(userDid);
      return;
    }

    const socket = getSocket();
    if (userDid) {
      joinUserRoom(userDid);
    }

    // Listen for live broadcasted notifications
    socket.off('new_notification');
    socket.on('new_notification', (newNotif) => {
      // Audio or toast alert
      toast.info(newNotif.title || 'New Notification', {
        description: newNotif.message,
      });

      set((state) => {
        const exists = state.notifications.some((n) => (n.did || n._id) === (newNotif.did || newNotif._id));
        if (exists) return state;

        const updated = [newNotif, ...state.notifications];
        const unread = updated.filter((n) => !n.isRead).length;
        return {
          notifications: updated,
          unreadCount: unread,
        };
      });
    });

    set({ isInitialized: true });
    get().fetchNotifications();
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/api/v1/notifications?limit=25');
      if (res.data?.success || res.data?.status === 'success') {
        const list = res.data.data || [];
        const unread = list.filter((n) => !n.isRead).length;
        set({ notifications: list, unreadCount: unread });
      }
    } catch (err) {
      console.warn('[NotificationStore] Fetch failed:', err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notifId) => {
    try {
      await apiClient.patch(`/api/v1/notifications/${notifId}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          (n.did || n._id) === notifId ? { ...n, isRead: true } : n
        );
        const unread = updated.filter((n) => !n.isRead).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (err) {
      console.error('[NotificationStore] markAsRead error:', err.message);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch('/api/v1/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('[NotificationStore] markAllAsRead error:', err.message);
    }
  },
}));
