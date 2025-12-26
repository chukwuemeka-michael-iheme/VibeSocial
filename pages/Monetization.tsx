
import React from 'react';
import { TrendingUp, Wallet, DollarSign, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DATA = [
  { name: 'Mon', revenue: 45 },
  { name: 'Tue', revenue: 52 },
  { name: 'Wed', revenue: 38 },
  { name: 'Thu', revenue: 65 },
  { name: 'Fri', revenue: 48 },
  { name: 'Sat', revenue: 95 },
  { name: 'Sun', revenue: 110 },
];

/* Added user prop to fix TypeScript error in App.tsx */
export const Monetization: React.FC<{ user: any }> = ({ user }) => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Creator Studio</h1>
          <p className="text-slate-500">Manage your earnings and monetization performance.</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 w-fit">
          <Wallet size={18} />
          Withdraw Funds
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Balance', value: '$1,250.75', change: '+12.5%', up: true, icon: <Wallet className="text-violet-500" /> },
          { label: 'Monthly Earnings', value: '$458.20', change: '+5.2%', up: true, icon: <DollarSign className="text-emerald-500" /> },
          { label: 'Active Subscribers', value: '142', change: '-2.1%', up: false, icon: <Users className="text-sky-500" /> },
          { label: 'Ad Revenue', value: '$320.15', change: '+18.4%', up: true, icon: <TrendingUp className="text-pink-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-950 rounded-lg">{stat.icon}</div>
              <div className={`flex items-center text-xs font-bold ${stat.up ? 'text-emerald-500' : 'text-pink-500'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold mb-6">Revenue Growth (Weekly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {[
              { id: '1', name: 'Subscription Payout', date: 'Oct 12, 2023', amount: '+$14.50', status: 'Completed' },
              { id: '2', name: 'Ad Revenue share', date: 'Oct 11, 2023', amount: '+$2.30', status: 'Completed' },
              { id: '3', name: 'Virtual Tip from @alex', date: 'Oct 11, 2023', amount: '+$5.00', status: 'Completed' },
              { id: '4', name: 'Bank Withdrawal', date: 'Oct 10, 2023', amount: '-$150.00', status: 'Processing' },
            ].map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.amount.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tx.name}</p>
                    <p className="text-xs text-slate-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-300'}`}>{tx.amount}</p>
                  <p className="text-[10px] text-slate-500">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
