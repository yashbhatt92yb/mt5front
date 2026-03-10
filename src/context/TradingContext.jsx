import React, { createContext, useContext, useState, useCallback } from 'react';

const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [login, setLogin] = useState(null);
  const [accountData, setAccountData] = useState({
    balance: 0,
    equity: 0,
    margin: 0,
    free_margin: 0,
    profit: 0,
  });
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState({});

  const updateAccountData = useCallback((data) => {
    setAccountData((prev) => ({ ...prev, ...data }));
  }, []);

  const updateQuotes = useCallback((symbol, data) => {
    setQuotes((prev) => ({
      ...prev,
      [symbol]: data,
    }));
  }, []);

  const updatePositions = useCallback((data) => {
    setPositions(data);
  }, []);

  const handlePositionUpdate = useCallback((update) => {
      // update.action could be 'update', 'close', etc.
      // For simplicity, we can fetch all positions again or update the specific one.
      // Based on common MT5 gateway patterns, 'update' often carries the whole object.
      setPositions(prev => {
          if (update.action === 'update') {
              const index = prev.findIndex(p => p.ticket === update.data.ticket);
              if (index !== -1) {
                  const newPositions = [...prev];
                  newPositions[index] = update.data;
                  return newPositions;
              } else {
                  return [...prev, update.data];
              }
          } else if (update.action === 'close') {
              return prev.filter(p => p.ticket !== update.data.ticket);
          }
          return prev;
      });
  }, []);

  const value = {
    login,
    setLogin,
    accountData,
    updateAccountData,
    positions,
    updatePositions,
    handlePositionUpdate,
    quotes,
    updateQuotes,
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
