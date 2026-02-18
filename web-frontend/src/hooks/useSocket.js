import { useEffect, useState } from 'react';
import { getSocket } from '../config/socket';

export const useSocket = (eventName, callback) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    if (eventName && callback) {
      socketInstance.on(eventName, callback);
    }

    return () => {
      if (eventName && callback) {
        socketInstance.off(eventName, callback);
      }
    };
  }, [eventName, callback]);

  return socket;
};
