import { useEffect, useRef, useCallback } from 'react';
import { useTrading } from '../context/TradingContext';

const WS_URL = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8080';

export const useMT5Socket = () => {
  const { login, updateAccountData, updateQuotes, handlePositionUpdate } = useTrading();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!login) return;

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

        switch (type) {
          case 'account_live':
            updateAccountData(data);
            break;
          case 'quote':
            // data from quote: { "type": "quote", "s": "EURUSD", "b": 1.10, "a": 1.11 }
            updateQuotes(s, { bid: b, ask: a });
            break;
          case 'position':
            // data from position: { "type": "position", "action": "update", "data": {...} }
            handlePositionUpdate(message);
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
        connect();
      }, 3000);
    };

    socketRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      socketRef.current.close();
    };
  }, [login, updateAccountData, updateQuotes, handlePositionUpdate]);

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
