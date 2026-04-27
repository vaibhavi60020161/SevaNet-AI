import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Users, Activity, TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json().catch(() => ({ activeNeeds: 0, volunteersOnline: 0, tasksCompleted: 0 }))),
      fetch('/api/needs').then(res => res.json().catch(() => []))
    ]).then(([statsData, needsData]) => {
      setStats(statsData);
      setNeeds(Array.isArray(needsData) ? needsData.slice(0, 8) : []); 
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-slate-500 font-bold font-mono tracking-widest text-sm uppercase">Synchronizing Network State...</div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Platform Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-[0.2em]">
              <Zap size={14} className="fill-current" />
              Network Operations Active
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Command Center Dashboard</h1>
            <p className="text-slate-400 max-w-xl font-medium">Real-time resource allocation and task tracking for humanitarian relief operations.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold font-mono">1.2s</div>
                <div className="text-[10px] text-slate-500 uppercase font-black">AI Latency</div>
             </div>
             <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold font-mono text-emerald-400">98.4%</div>
                <div className="text-[10px] text-slate-500 uppercase font-black">Sync Rate</div>
             </div>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Needs', value: stats?.activeNeeds || 0, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Volunteers Online', value: stats?.volunteersOnline || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Tasks Completed', value: stats?.tasksCompleted || 45, icon: Activity, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
          { label: 'Network Shield', value: 'Active', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        ].map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white p-6 rounded-2xl border ${item.border} shadow-sm relative group overflow-hidden`}
          >
            <div className={`absolute inset-0 ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center ${item.color} mb-4`}>
                <item.icon size={20} />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{item.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Latest Needs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              Deployment Pipeline
            </h2>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">LIVE UPDATES</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needs.map((need) => (
              <motion.div 
                key={need.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ y: -2 }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                    need.urgency === 'critical' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {need.urgency}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">#{need.id.slice(-4)}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1 leading-tight">{need.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{need.description}</p>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-4 border-t border-slate-50">
                  <span className="flex items-center gap-1 uppercase tracking-wider"><MapPin size={10} /> {need.location}</span>
                  <span className="text-sky-600 uppercase tracking-wider">{need.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              Intelligence
            </h2>
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden ring-1 ring-white/10 shadow-xl">
              <TrendingUp className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
              <div className="relative z-10">
                <div className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  Neural Prediction
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-bold font-mono italic">
                  "Significant trend detected in medical assistance requests within the Kothrud cluster. Resource deficit predicted for next cycle."
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    <span>Priority Score</span>
                    <span>9.4 / 10</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[94%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Global Impact</h3>
            <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">System-wide coordination has resulted in 23% faster response times this quarter.</p>
            <div className="space-y-3 mb-6">
               <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Volunteers</div>
                  <div className="text-sm font-black text-slate-900 font-mono">142</div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ongoing Tasks</div>
                  <div className="text-sm font-black text-slate-900 font-mono">28</div>
               </div>
            </div>
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm active:scale-95">
              Access Public Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
