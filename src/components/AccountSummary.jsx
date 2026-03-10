import React from 'react';
import { useTrading } from '../context/TradingContext';
import { Wallet, TrendingUp, ShieldCheck, PieChart } from 'lucide-react';

const AccountSummary = () => {
  const { accountData } = useTrading();

  const metrics = [
    {
      label: 'Balance',
      value: accountData.balance,
      icon: Wallet,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Equity',
      value: accountData.equity,
      icon: ShieldCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Free Margin',
      value: accountData.free_margin,
      icon: PieChart,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Live Profit',
      value: accountData.profit,
      icon: TrendingUp,
      color: accountData.profit >= 0 ? 'text-emerald-500' : 'text-rose-500',
      bg: accountData.profit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-sm ring-1 ring-slate-800 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{metric.label}</p>
              <p className={`mt-2 text-2xl font-bold tracking-tight ${metric.color}`}>
                ${metric.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${metric.bg}`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountSummary;
