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
  getInfo: async (login) => {
    const response = await api.post('/user/info', { login });
    return response.data;
  },
  getHistory: async (login, from = 0, to = 0) => {
    const response = await api.post('/user/history', { login, from, to });
    return response.data;
  }
};

export const tradeService = {
  placeOrder: async (order) => {
    const response = await api.post('/trade/place', order);
    return response.data;
  },
  placePendingOrder: async (order) => {
    const response = await api.post('/trade/place_pending', order);
    return response.data;
  },
  closeTrade: async (trade) => {
    const response = await api.post('/trade/close', trade);
    return response.data;
  },
  cancelOrder: async (login, ticket) => {
    const response = await api.post('/trade/cancel', { login, ticket });
    return response.data;
  },
  modifyTrade: async (modifyData) => {
    const response = await api.post('/trade/modify', modifyData);
    return response.data;
  }
};

export default api;
