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
    if (!data) return;
    setAccountData((prev) => ({
      ...prev,
      balance: data.balance ?? prev.balance,
      equity: data.equity ?? prev.equity,
      margin: data.margin ?? prev.margin,
      free_margin: data.free_margin ?? prev.free_margin,
      profit: data.profit ?? prev.profit,
    }));
  }, []);

  const updateQuotes = useCallback((symbol, data) => {
    if (!symbol || !data) return;
    setQuotes((prev) => ({
      ...prev,
      [symbol]: data,
    }));
  }, []);

  const updatePositions = useCallback((data) => {
    // Backend often wraps data in { success: true, data: [...] }
    const positionsArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
    setPositions(positionsArray);
  }, []);

  const handlePositionUpdate = useCallback((update) => {
      // update.action could be 'update', 'close', etc.
      // Based on the C++ backend: BroadcastPositionUpdate("update", position)
      if (!update || !update.data) return;

      setPositions(prev => {
          const positionData = update.data;
          if (update.action === 'update' || update.action === 'open') {
              const index = prev.findIndex(p => p.ticket === positionData.ticket);
              if (index !== -1) {
                  const newPositions = [...prev];
                  newPositions[index] = { ...newPositions[index], ...positionData };
                  return newPositions;
              } else {
                  return [...prev, positionData];
              }
          } else if (update.action === 'close') {
              return prev.filter(p => p.ticket !== positionData.ticket);
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
