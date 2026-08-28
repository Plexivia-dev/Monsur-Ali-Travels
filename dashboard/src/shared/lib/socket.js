import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    // Connect to WebSocket server using current API_BASE_URL
    const socketUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    
    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.info('[Socket.IO] Connected to live gateway:', socketInstance.id);
      
      // Auto-join personal room if cached user exists
      try {
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userDid = cachedUser.did || cachedUser.id;
        if (userDid) {
          socketInstance.emit('join_room', { userDid });
        }
      } catch (_) {}
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.info('[Socket.IO] Disconnected:', reason);
    });
  }

  return socketInstance;
}

export function joinUserRoom(userDid) {
  const s = getSocket();
  if (s && userDid) {
    if (s.connected) {
      s.emit('join_room', { userDid });
    } else {
      s.once('connect', () => {
        s.emit('join_room', { userDid });
      });
    }
  }
}
