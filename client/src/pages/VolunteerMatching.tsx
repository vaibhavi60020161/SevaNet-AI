import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Zap, 
  UserCheck, 
  AlertCircle,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Need {
  _id: string;
  title: string;
  category: string;
  urgency: string;
  location: string;
  status: string;
  families: number;
}

interface Volunteer {
  _id: string;
  name: string;
  skills: string[];
  status: string;
  location: string;
  impactScore: number;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: string;
  location: string;
}

const VolunteerMatching = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [successMatch, setSuccessMatch] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [needsRes, volsRes, tasksRes] = await Promise.all([
          fetch('/api/needs'),
          fetch('/api/volunteers'),
          fetch('/api/tasks')
        ]);
        
        const needsData = await needsRes.json();
        const volsData = await volsRes.json();
        const tasksData = await tasksRes.json();
        
        setNeeds(needsData.filter((n: Need) => n.status === 'pending'));
        setVolunteers(volsData.filter((v: Volunteer) => v.status === 'online'));
        setTasks(tasksData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  const handleMatch = async (needId: string) => {
    setMatchingId(needId);
    try {
      const res = await fetch('/api/tasks/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needId })
      });
      
      const result = await res.json();
      
      if (result.success) {
        setSuccessMatch(`Successfully assigned to ${result.volunteer.name}`);
        // Refresh data
        const [needsRes, volsRes, tasksRes] = await Promise.all([
          fetch('/api/needs'),
          fetch('/api/volunteers'),
          fetch('/api/tasks')
        ]);
        
        const needsData = await needsRes.json();
        const volsData = await volsRes.json();
        const tasksData = await tasksRes.json();
        
        setNeeds(needsData.filter((n: Need) => n.status === 'pending'));
        setVolunteers(volsData.filter((v: Volunteer) => v.status === 'online'));
        setTasks(tasksData);
      }
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      setMatchingId(null);
      setTimeout(() => setSuccessMatch(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
              <Zap size={16} />
              Seva Intelligent Orchestration
            </div>
            <h1 className="text-3xl font-bold text-slate-900">AI Volunteer Matching</h1>
            <p className="text-slate-600">Connecting resources to requirements in real-time</p>
          </div>
          
          <div className="hidden md:flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="text-sm">
                <span className="font-bold text-slate-900">{volunteers.length}</span>
                <span className="text-slate-500 ml-1 text-xs">Online Support</span>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-500" />
              <div className="text-sm">
                <span className="font-bold text-slate-900">{needs.length}</span>
                <span className="text-slate-500 ml-1 text-xs">Unassigned Needs</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {successMatch && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-green-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold"
            >
              <CheckCircle2 size={20} />
              {successMatch}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Active Needs Container */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Pending Critical Needs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {needs.length > 0 ? (
                needs.map((need) => (
                  <motion.div 
                    key={need._id}
                    layout
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">
                        {need.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                        need.urgency === 'critical' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {need.urgency}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{need.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                      <MapPin size={14} />
                      {need.location}
                    </div>
                    
                    <button
                      onClick={() => handleMatch(need._id)}
                      disabled={matchingId === need._id}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                      {matchingId === need._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Finding Match...
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          Assign Best Volunteer
                        </>
                      )}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-12 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">All needs have been assigned!</p>
                </div>
              )}
            </div>
          </div>

          {/* Online Volunteers Container */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Available Agents</h2>
            <div className="space-y-4">
              {volunteers.map((vol) => (
                <div key={vol._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {vol.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none mb-1">{vol.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ready for Mission</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vol.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] py-0.5 px-2 bg-slate-100 text-slate-600 font-bold rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Zap size={14} fill="currentColor" />
                      <span className="text-xs font-bold">{vol.impactScore} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin size={12} />
                      {vol.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matched Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck size={24} className="text-blue-600" />
              Recent Assignments
            </h2>
            <button className="text-blue-600 font-bold text-sm hover:underline">View All Task Logs</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="bg-white p-5 border-l-4 border-blue-600 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-900 leading-snug">{task.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <UserCheck size={14} className="text-slate-400" />
                    <span>Assigned to: <span className="font-bold text-slate-700">{task.assignedTo}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{task.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default VolunteerMatching;
