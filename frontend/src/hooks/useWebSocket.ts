import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(onMessage: (message: any) => void) {
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}`);

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        onMessage(message);
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        setTimeout(connect, 10000);
      };

      socketRef.current = socket;
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  return socketRef;
}
