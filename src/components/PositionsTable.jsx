import React, { useEffect, useState, useCallback } from 'react';
import { useTrading } from '../context/TradingContext';
import { userService, tradeService } from '../services/api';
import { XCircle, TrendingUp, TrendingDown, RefreshCcw, LayoutList } from 'lucide-react';

const PositionsTable = () => {
  const { login, positions, updatePositions } = useTrading();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPositions = useCallback(async () => {
    if (!login) return;
    setLoading(true);
    try {
      const response = await userService.getPositions(parseInt(login));
      updatePositions(response);
    } catch (err) {
      console.error('Failed to fetch positions', err);
    } finally {
      setLoading(false);
    }
  }, [login, updatePositions]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleCloseOrCancel = async (pos) => {
    setActionLoading(pos.ticket);
    try {
      let result;
      // Pending orders have types 2-7
      const isPending = pos.type >= 2 && pos.type <= 7;

      if (isPending) {
        result = await tradeService.cancelOrder(parseInt(login), pos.ticket);
      } else {
        result = await tradeService.closeTrade({
          login: parseInt(login),
          ticket: pos.ticket,
          symbol: pos.symbol,
          volume: pos.volume,
          type: pos.type === 0 ? 1 : 0,
        });
      }

      if (result.success) {
        setTimeout(fetchPositions, 500);
      }
    } catch (err) {
      console.error('Failed to handle action', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 0: return 'Buy';
      case 1: return 'Sell';
      case 2: return 'Buy Limit';
      case 3: return 'Sell Limit';
      case 4: return 'Buy Stop';
      case 5: return 'Sell Stop';
      case 6: return 'Buy Stop Limit';
      case 7: return 'Sell Stop Limit';
      default: return 'Unknown';
    }
  };

  const isPending = (type) => type >= 2 && type <= 7;

  return (
    <div className="rounded-2xl bg-slate-900 shadow-sm ring-1 ring-slate-800 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-900/50">
        <div className="flex items-center gap-2">
           <LayoutList className="h-5 w-5 text-blue-500" />
           <h3 className="text-lg font-semibold text-white">Active Positions & Orders</h3>
        </div>
        <button
          onClick={fetchPositions}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800/50 text-xs font-medium uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Symbol</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Volume</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Profit</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {positions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                  {loading ? 'Fetching active items...' : 'No open positions or pending orders.'}
                </td>
              </tr>
            ) : (
              positions.map((pos) => (
                <tr key={pos.ticket} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                       {pos.type === 0 || pos.type === 2 || pos.type === 4 || pos.type === 6 ? (
                         <TrendingUp className="h-4 w-4 text-emerald-500" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-rose-500" />
                       )}
                       {pos.symbol}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ring-inset ${
                      [0, 2, 4, 6].includes(pos.type)
                        ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 ring-rose-500/20'
                    }`}>
                      {getTypeName(pos.type)}
                    </span>
                    {isPending(pos.type) && (
                      <span className="ml-2 text-[10px] text-slate-500 font-medium">PENDING</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-200">{pos.volume}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-200">
                     {isPending(pos.type) ? pos.price : pos.open_price}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    pos.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {isPending(pos.type) ? '-' : (
                      <>{pos.profit >= 0 ? '+' : ''}{pos.profit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleCloseOrCancel(pos)}
                      disabled={actionLoading === pos.ticket}
                      title={isPending(pos.type) ? "Cancel Order" : "Close Position"}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset transition-all disabled:opacity-50 ${
                        isPending(pos.type)
                          ? 'bg-slate-800 text-slate-400 ring-slate-700 hover:bg-rose-500 hover:text-white'
                          : 'bg-rose-500/10 text-rose-500 ring-rose-500/20 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      {actionLoading === pos.ticket ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsTable;
