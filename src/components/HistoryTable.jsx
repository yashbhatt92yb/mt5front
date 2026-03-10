import React, { useEffect, useState, useCallback } from 'react';
import { useTrading } from '../context/TradingContext';
import { userService } from '../services/api';
import { History, RefreshCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const HistoryTable = () => {
  const { login, history, updateHistory } = useTrading();
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!login) return;
    setLoading(true);
    try {
      const response = await userService.getHistory(parseInt(login));
      updateHistory(response);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  }, [login, updateHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="rounded-2xl bg-slate-900 shadow-sm ring-1 ring-slate-800 overflow-hidden mt-8">
      <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-900/50">
        <div className="flex items-center gap-2">
           <History className="h-5 w-5 text-indigo-500" />
           <h3 className="text-lg font-semibold text-white">Trade History</h3>
        </div>
        <button
          onClick={fetchHistory}
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
              <th className="px-6 py-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {history.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                  {loading ? 'Fetching trade history...' : 'No historical trades found.'}
                </td>
              </tr>
            ) : (
              history.map((trade, idx) => (
                <tr key={trade.ticket || idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">
                    {trade.symbol}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ring-inset ${
                      trade.type === 0
                        ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 ring-rose-500/20'
                    }`}>
                      {trade.type === 0 ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-200">{trade.volume}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-200">{trade.price}</td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {trade.profit >= 0 ? '+' : ''}{trade.profit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">
                    {trade.time ? new Date(trade.time * 1000).toLocaleString() : 'N/A'}
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

export default HistoryTable;
