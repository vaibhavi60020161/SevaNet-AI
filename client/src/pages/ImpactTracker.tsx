import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Heart, 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Download,
  CheckCircle2,
  Package,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface ImpactLog {
  _id: string;
  event: string;
  desc: string;
  timestamp: string;
  icon?: string;
}

const ImpactTracker = () => {
  const [logs, setLogs] = useState<ImpactLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/impact')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching impact logs:', err));
  }, []);

  const stats = [
    { label: 'Families Helped', value: '1,250', delta: '+12%', icon: Users, color: 'blue' },
    { label: 'Needs Resolved', value: '458', delta: '+8%', icon: CheckCircle2, color: 'emerald' },
    { label: 'Volunteers Deployed', value: '84', delta: '+15%', icon: Package, color: 'rose' }
  ];

  const areaData = [
    { name: 'Hadapsar', count: 145 },
    { name: 'Kothrud', count: 120 },
    { name: 'Wakad', count: 98 },
    { name: 'Katraj', count: 85 },
    { name: 'Yerawada', count: 110 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Activity size={14} />
              Impact Analytics v4.2
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 leading-tight">
              PROVING OUR <span className="text-blue-500 underline decoration-4 underline-offset-8">PROMISE</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium">
              Transparent, real-time verification of humanitarian efforts and resource allocation efficiency.
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-blue-500/10">
            <Download size={18} />
            Export Impact Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <ArrowUpRight size={14} />
                  {stat.delta}
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</h2>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Timeline Section */}
          <section>
            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase mb-8 flex items-center gap-3">
              <Calendar size={24} className="text-blue-600" />
              Verified Event Stream
            </h3>
            
            <div className="relative border-l-4 border-slate-100 ml-4 py-4 space-y-10">
              {logs.map((log, idx) => (
                <div key={log._id} className="relative pl-10">
                  <div className="absolute -left-[22px] top-0 w-10 h-10 rounded-2xl bg-white border-4 border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <Heart size={18} fill="currentColor" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase italic tracking-tighter">{log.event}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
                      {log.desc}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="pl-10 space-y-8 animate-pulse">
                   {[1,2,3].map(i => (
                     <div key={i} className="space-y-3">
                       <div className="w-32 h-4 bg-slate-100 rounded"></div>
                       <div className="w-full h-20 bg-slate-50 rounded-2xl"></div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </section>

          {/* Chart Section */}
          <section className="space-y-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                <MapPin size={24} className="text-blue-600" />
                Distribution by District
              </h3>
              <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 shadow-sm overflow-hidden h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areaData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontWeight: 800, fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" radius={[0, 20, 20, 0]} barSize={32}>
                      {areaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[40px] p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 group-hover:opacity-20 pointer-events-none">
                 <Heart size={240} />
               </div>
               <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">Sustainability Forecast</h4>
               <p className="opacity-80 font-medium mb-8 leading-relaxed">
                 Our current growth pattern suggests a 22% increase in resource mobilization efficiency by Q3 2026.
               </p>
               <div className="flex items-center gap-6">
                 <div>
                   <p className="text-3xl font-black tracking-tighter leading-none">94.2%</p>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Fulfillment Rate</p>
                 </div>
                 <div className="w-px h-10 bg-white/20"></div>
                 <div>
                   <p className="text-3xl font-black tracking-tighter leading-none">8.4m</p>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Response Time</p>
                 </div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ImpactTracker;
