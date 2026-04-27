import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Flame, 
  Users, 
  MapPin, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface PredictionTrend {
  day: string;
  food: number;
  medical: number;
  shelter: number;
}

interface Alert {
  message: string;
  location: string;
  probability: 'High' | 'Medium' | 'Low';
}

const CrisisPrediction = () => {
  const [trends, setTrends] = useState<PredictionTrend[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/predictions')
      .then((res) => res.json())
      .then((data) => {
        setTrends(data.trends);
        setAlerts(data.alerts);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching predictions:', err));
  }, []);

  const risks = [
    {
      id: 1,
      title: 'Overcrowding Risk',
      level: 'High',
      desc: 'Significant congestion detected in transit camps.',
      area: 'Hadapsar Sector 4',
      action: 'Redirect new arrivals to Kharadi bypass center.',
      icon: Users,
      color: 'red'
    },
    {
      id: 2,
      title: 'Suspicious Activity',
      level: 'Medium',
      desc: 'Unusual patterns detected in resource distribution logs.',
      area: 'Kothrud West',
      action: 'Deploy on-ground supervisor for audit.',
      icon: ShieldAlert,
      color: 'amber'
    },
    {
      id: 3,
      title: 'Fire Hazard',
      level: 'Low',
      desc: 'High temperature and wind speed increases hazard risk.',
      area: 'Yerawada Industrial',
      action: 'Verify fire hydrant operational status.',
      icon: Flame,
      color: 'green'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-blue-600" size={24} />
            <span className="text-blue-600 font-bold uppercase tracking-wider text-xs">AI Predictive Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Crisis Prediction Dashboard</h1>
          <p className="text-slate-600">Advanced resource modeling and risk assessment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {risks.map((risk) => (
            <motion.div 
              key={risk.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${risk.color}-50 text-${risk.color}-600`}>
                  <risk.icon size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(risk.level)}`}>
                  {risk.level} Risk
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{risk.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{risk.desc}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="font-medium">{risk.area}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <TrendingUp size={16} className="text-slate-400 mt-0.5" />
                  <span>Action: {risk.action}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                7-Day Resource Demand Trend
              </h3>
              <select className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1 outline-none">
                <option>All Resources</option>
                <option>Food Only</option>
                <option>Medical Only</option>
              </select>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="food" name="Food Supply" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medical" name="Medical Aid" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shelter" name="Shelter" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Real-time Alerts
            </h3>
            
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-4">
                  <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${getDotColor(alert.probability)} animate-pulse`}></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{alert.message}</h4>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                         <MapPin size={10} />
                         {alert.location}
                       </div>
                       <div className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-md ${getLevelColor(alert.probability)}`}>
                         Prob: {alert.probability}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                View All Intelligence Reports
                <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-indigo-600 rounded-2xl text-white">
              <p className="text-xs font-medium opacity-80 mb-2 uppercase tracking-widest">Model Accuracy</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">94.8%</span>
                <span className="text-xs font-bold mb-1.5 text-indigo-200">+2.1% this week</span>
              </div>
              <div className="w-full bg-indigo-500/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[94.8%]"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CrisisPrediction;
