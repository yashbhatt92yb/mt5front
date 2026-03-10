import axios from 'axios';

const API_REST_URL = import.meta.env.VITE_API_REST_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_REST_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (login, password) => {
    const response = await api.post('/auth/login', { login, password });
    return response.data;
  },
};

export const userService = {
  getPositions: async (login) => {
    const response = await api.post('/user/positions', { login });
    return response.data;
  },
};

export const tradeService = {
  placeOrder: async (order) => {
    // order: { login, symbol, volume, type, sl, tp }
    const response = await api.post('/trade/place', order);
    return response.data;
  },
  placePendingOrder: async (order) => {
    // order: { login, symbol, volume, type, price, stop_limit_price }
    const response = await api.post('/trade/place_pending', order);
    return response.data;
  },
  closeTrade: async (trade) => {
    // trade: { login, ticket, symbol, volume, type }
    const response = await api.post('/trade/close', trade);
    return response.data;
  },
  cancelOrder: async (login, ticket) => {
    const response = await api.post('/trade/cancel', { login, ticket });
    return response.data;
  },
};

export default api;
