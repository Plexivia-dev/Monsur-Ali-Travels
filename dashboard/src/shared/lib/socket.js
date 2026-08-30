import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api-client';

let socketInstance = null;

export function getSocketUrl() {
  if (import.meta.env?.VITE_SOCKET_URL) {
    const customUrl = String(import.meta.env.VITE_SOCKET_URL).trim();
    if (customUrl.startsWith('http://') || customUrl.startsWith('https://')) {
      return customUrl;
    }
  }

  if (API_BASE_URL && typeof API_BASE_URL === 'string') {
    try {
      const parsed = new URL(API_BASE_URL);
      if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        return parsed.origin;
      }
    } catch (_) {}
  }

  return 'https://api.monsuralitravels.com';
}

export function getSocket() {
  if (!socketInstance) {
    const socketUrl = getSocketUrl();
    
    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.info('[Socket.IO] Connected to live gateway:', socketInstance.id, 'URL:', socketUrl);
      
      // Auto-join personal room if cached user exists
      try {
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userDid = cachedUser.did || cachedUser.id || cachedUser._id;
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
