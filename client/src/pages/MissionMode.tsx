import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  MapPin, 
  Award, 
  Users, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';

interface Volunteer {
  _id: string;
  name: string;
  impactScore: number;
  status: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  location: string;
  deadline: string;
}

const MissionMode = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [missions, setMissions] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Volunteer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volsRes, tasksRes] = await Promise.all([
          fetch('/api/volunteers'),
          fetch('/api/tasks')
        ]);
        
        const volsData = await volsRes.json();
        const tasksData = await tasksRes.json();
        
        setVolunteers(volsData.sort((a: any, b: any) => b.impactScore - a.impactScore));
        setMissions(tasksData);
        // Simulate current user context for demo purposes
        setCurrentUser(volsData[0] || null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  const completedCount = missions.filter(m => m.status.toLowerCase() === 'completed').length;
  const totalCount = missions.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-tighter italic text-sm">
              <Zap size={18} fill="currentColor" />
              Volunteer Alpha Access
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">
              Mission <span className="text-indigo-500">Mode</span>
            </h1>
            
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={160} />
              </div>
              <div className="relative z-10">
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-6xl font-black text-white">{currentUser?.impactScore || 0}</span>
                  <div className="mb-2">
                    <p className="text-indigo-400 font-black uppercase text-xs tracking-widest leading-none">Total Impact Score</p>
                    <p className="text-slate-500 text-xs font-bold leading-none mt-1">Level 4 Field Agent</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Campaign Progress</span>
                    <span>{progressPercent}% Complete</span>
                  </div>
                  <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'People Helped', value: '1,240', icon: Users, color: 'blue' },
                { label: 'Hours Deployed', value: '45.2', icon: Clock, color: 'emerald' },
                { label: 'Areas Secured', value: '18', icon: ShieldCheck, color: 'indigo' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                   <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
                     <stat.icon size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 leading-none mb-1">{stat.label}</p>
                     <p className="text-xl font-black leading-none">{stat.value}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-amber-500" size={20} />
              <h3 className="font-black uppercase tracking-tighter text-lg">Elite Leaderboard</h3>
            </div>
            
            <div className="space-y-4">
              {volunteers.slice(0, 5).map((vol, index) => (
                <div key={vol._id} className={`flex items-center gap-4 p-3 rounded-2xl transition-colors ${index === 0 ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic ${
                    index === 0 ? 'bg-amber-500 text-black' : 
                    index === 1 ? 'bg-slate-300 text-black' : 
                    index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-none mb-1">{vol.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Agent</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-200">
                      <Zap size={12} className="text-indigo-400" fill="currentColor" />
                      <span className="font-black italic">{vol.impactScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              Full Agency Rankings
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Active Missions */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Target className="text-rose-500" size={24} />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Active Field Ops</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <motion.div 
                key={mission.id}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative group overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110 pointer-events-none ${
                    mission.status.toLowerCase() === 'completed' ? 'text-emerald-500' : 'text-indigo-500'
                  }`}>
                   {mission.status.toLowerCase() === 'completed' ? <ShieldCheck size={100} /> : <Target size={100} />}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic ${
                    mission.status.toLowerCase() === 'completed' ? 'bg-emerald-500 text-black' : 'bg-indigo-600 text-white'
                  }`}>
                    {mission.status}
                  </span>
                  <div className="flex items-center gap-1 text-indigo-400 font-black text-xs italic">
                     <Flame size={14} fill="currentColor" />
                     +50 XP
                  </div>
                </div>

                <h3 className="text-xl font-black uppercase leading-tight mb-4 tracking-tighter">{mission.title}</h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={16} />
                    <span className="text-sm font-bold">{mission.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Clock size={16} />
                    <span className="text-sm font-bold">Due: {mission.deadline}</span>
                  </div>
                </div>

                {mission.status.toLowerCase() !== 'completed' && (
                  <button 
                    className="w-full py-4 bg-indigo-600 hover:bg-emerald-500 hover:text-black transition-all rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 text-sm"
                  >
                    Complete Mission
                    <ArrowRight size={18} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MissionMode;
