import { useEffect } from 'react';
import { useAuth } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { getSocket } from '@shared/lib/socket';

/**
 * Custom hook to initialize real-time notifications for the admin dashboard
 * using the centralized notification store and singleton Socket.IO connection.
 */
export function useSocketNotification() {
  const { user } = useAuth();
  const initSocket = useNotificationStore((state) => state.initSocket);

  useEffect(() => {
    const userDid = user?.did || user?.id || user?._id;
    if (userDid) {
      initSocket(userDid);
    }
  }, [user?.did, user?.id, user?._id, initSocket]);

  return getSocket();
}

export default useSocketNotification;
