import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { tradeService } from '../services/api';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

const TradeForm = () => {
  const { login, quotes } = useTrading();
  const [symbol, setSymbol] = useState('EURUSD');
  const [volume, setVolume] = useState(0.1);
  const [type, setType] = useState('0');
  // 0: Buy, 1: Sell, 2: Buy Limit, 3: Sell Limit, 4: Buy Stop, 5: Sell Stop, 6: Buy Stop Limit, 7: Sell Stop Limit
  const [price, setPrice] = useState('');
  const [stopLimitPrice, setStopLimitPrice] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const isPending = ['2', '3', '4', '5', '6', '7'].includes(type);
  const isStopLimit = ['6', '7'].includes(type);
  const currentQuote = quotes[symbol] || { bid: 0, ask: 0 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      let result;
      const orderPayload = {
        login: parseInt(login),
        symbol,
        volume: parseFloat(volume),
        type: parseInt(type),
        sl: parseFloat(sl) || 0,
        tp: parseFloat(tp) || 0,
      };

      if (isPending) {
        result = await tradeService.placePendingOrder({
          ...orderPayload,
          price: parseFloat(price),
          stop_limit_price: isStopLimit ? parseFloat(stopLimitPrice) : 0,
        });
      } else {
        result = await tradeService.placeOrder(orderPayload);
      }

      if (result.success) {
        setStatus({ type: 'success', message: 'Order placed successfully!' });
      } else {
        setStatus({ type: 'error', message: result.message || 'Failed to place order.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Error placing order.' });
    } finally {
      setLoading(false);
    }
  };

  const orderTypes = [
    { id: '0', label: 'Buy', color: 'bg-emerald-600 hover:bg-emerald-500' },
    { id: '1', label: 'Sell', color: 'bg-rose-600 hover:bg-rose-500' },
    { id: '2', label: 'Buy Limit', color: 'bg-slate-700 hover:bg-slate-600' },
    { id: '3', label: 'Sell Limit', color: 'bg-slate-700 hover:bg-slate-600' },
    { id: '4', label: 'Buy Stop', color: 'bg-slate-700 hover:bg-slate-600' },
    { id: '5', label: 'Sell Stop', color: 'bg-slate-700 hover:bg-slate-600' },
    { id: '6', label: 'Buy Stop Limit', color: 'bg-slate-700 hover:bg-slate-600' },
    { id: '7', label: 'Sell Stop Limit', color: 'bg-slate-700 hover:bg-slate-600' },
  ];

  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-sm ring-1 ring-slate-800">
      <h3 className="text-lg font-semibold text-white mb-6">New Trade</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Symbol
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border-0 py-2 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
            >
              <option value="EURUSD">EURUSD</option>
              <option value="XAUUSD">XAUUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="USDJPY">USDJPY</option>
              <option value="BTCUSD">BTCUSD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Volume
            </label>
            <input
              type="number"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border-0 py-2 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Order Type
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {orderTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  type === t.id ? t.color : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isPending && (
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.00001"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border-0 py-2 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}
          {isStopLimit && (
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Stop Limit Price
              </label>
              <input
                type="number"
                step="0.00001"
                required
                value={stopLimitPrice}
                onChange={(e) => setStopLimitPrice(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border-0 py-2 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}
          <div className={!(isPending || isStopLimit) ? 'col-span-2' : (isPending && !isStopLimit ? '' : 'col-span-2')}>
             <div className="flex justify-between items-center text-xs text-slate-500 mb-1 px-1">
                <span>Ask: <span className="text-emerald-500">{currentQuote.ask.toFixed(5)}</span></span>
                <span>Bid: <span className="text-rose-500">{currentQuote.bid.toFixed(5)}</span></span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 text-rose-400">
              Stop Loss
            </label>
            <input
              type="number"
              step="0.00001"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border-0 py-2 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 text-emerald-400">
              Take Profit
            </label>
            <input
              type="number"
              step="0.00001"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border-0 py-2 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {status.message && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
          }`}>
            <AlertCircle className="h-4 w-4" />
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 ${
            ['0', '2', '4', '6'].includes(type) ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
          }`}
        >
          {loading ? 'Processing...' : `Place ${['0', '2', '4', '6'].includes(type) ? 'Buy' : 'Sell'} Order`}
        </button>
      </form>
    </div>
  );
};

export default TradeForm;
