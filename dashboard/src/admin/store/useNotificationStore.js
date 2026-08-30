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
      if (!newNotif) return;

      const notifType = newNotif.type === 'danger' || newNotif.type === 'error'
        ? 'error'
        : newNotif.type === 'warning'
        ? 'warning'
        : 'info';

      if (notifType === 'error') {
        toast.error(newNotif.title || 'System Alert', {
          description: newNotif.message,
        });
      } else if (notifType === 'warning') {
        toast.warning(newNotif.title || 'System Warning', {
          description: newNotif.message,
        });
      } else {
        toast.info(newNotif.title || 'New Notification', {
          description: newNotif.message,
        });
      }

      set((state) => {
        const notifId = newNotif.did || newNotif._id || newNotif.id;
        const exists = state.notifications.some((n) => (n.did || n._id || n.id) === notifId);
        if (exists) return state;

        const formatted = {
          ...newNotif,
          id: notifId,
          did: newNotif.did || notifId,
          isRead: Boolean(newNotif.isRead),
        };

        const updated = [formatted, ...state.notifications];
        const unread = updated.filter((n) => !n.isRead).length;
        return {
          notifications: updated,
          unreadCount: unread,
        };
      });
    });

    set({ isInitialized: true });
    get().fetchNotifications(userDid);
  },

  fetchNotifications: async (userDid) => {
    set({ isLoading: true });
    try {
      const url = userDid
        ? `/api/v1/notifications?limit=30&userDid=${encodeURIComponent(userDid)}`
        : '/api/v1/notifications?limit=30';
      const res = await apiClient.get(url);
      if (res.data?.success || res.data?.status === 'success') {
        const list = (res.data.data || []).map((n) => ({
          ...n,
          id: n.did || n._id || n.id,
          did: n.did || n._id || n.id,
        }));
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
