import { useEffect, useRef, useCallback } from 'react';
import { useTrading } from '../context/TradingContext';

const WS_URL = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8080';

export const useMT5Socket = () => {
  const { login, updateAccountData, updateQuotes, handlePositionUpdate } = useTrading();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!login) return;

    console.log(`Connecting to WebSocket at ${WS_URL} for login ${login}...`);
    socketRef.current = new WebSocket(WS_URL);

    socketRef.current.onopen = () => {
      console.log('Connected to MT5 WebSocket');

      // Subscribe to Live Account
      socketRef.current.send(JSON.stringify({
        action: 'subscribe_account',
        login: parseInt(login),
      }));

      // Subscribe to Quotes
      socketRef.current.send(JSON.stringify({
        action: 'subscribe',
        symbols: ["EURUSD", "XAUUSD", "GBPUSD", "USDJPY", "BTCUSD"],
      }));
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, data, s, b, a } = message;

        if (type !== 'quote') {
            console.log('WS Message:', message);
        }

        switch (type) {
          case 'account':
          case 'account_live': {
            const updateLogin = data.login || data.Login;
            if (!updateLogin || parseInt(updateLogin) === parseInt(login)) {
                updateAccountData(data);
            }
            break;
          }
          case 'quote':
            updateQuotes(s, { bid: b, ask: a });
            break;
          case 'position':
            if (data && (!data.login || parseInt(data.login) === parseInt(login))) {
                handlePositionUpdate(message);
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    socketRef.current.onclose = () => {
      console.log('MT5 WebSocket closed. Attempting to reconnect...');
      reconnectTimeoutRef.current = setTimeout(() => {
        // Use a function reference that is stable or check how to best call this
        // To avoid lint error we can use the ref or just be careful.
        // Actually since it is a useCallback, it is fine to call it by name but lint is strict.
        if (socketRef.current && socketRef.current.readyState === WebSocket.CLOSED) {
           // We'll call connect indirectly or just ignore this specific lint for now if we can
        }
      }, 3000);
    };

    socketRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [login, updateAccountData, updateQuotes, handlePositionUpdate]);

  // Handle reconnection outside to avoid circular dependency in lint
  useEffect(() => {
    if (!login) return;

    const checkConnection = setInterval(() => {
       if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
          connect();
       }
    }, 5000);

    return () => clearInterval(checkConnection);
  }, [login, connect]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = (msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  return { sendMessage };
};
